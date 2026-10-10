const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');

// Compile the real source without adding a test runner dependency.
function sourceLoader(reactOverride) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(__dirname, '../src', relative);
    if (cache.has(filename)) return cache.get(filename);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const module = { exports: {} };
    cache.set(filename, module.exports);
    const localRequire = name => {
      if (name === 'react' && reactOverride) return reactOverride;
      if (!name.startsWith('.')) return require(name);
      const base = path.resolve(path.dirname(filename), name);
      const dependency = ['.ts', '.tsx'].map(extension => base + extension).find(fs.existsSync);
      return load(path.relative(path.resolve(__dirname, '../src'), dependency));
    };
    new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
    cache.set(filename, module.exports);
    return module.exports;
  }
  return load;
}
const load = sourceLoader();
const { parseStoredSkills, sampleSkills, STORAGE_KEY } = load('utils/skillStorage.ts');
const legacy = { id: 1, name: ' React ', level: 'Intermediate', progress: 80, completed: false };

// A small hook lifecycle harness checks state/effects without simulating a browser DOM.
function harness(saved, failRead = false) {
  const previousStorage = global.localStorage;
  const previousWindow = global.window;
  const storage = new Map(saved === undefined ? [] : [[STORAGE_KEY, saved]]);
  const writes = [];
  const timers = new Map();
  const states = [];
  const effects = [];
  let cursor = 0;
  let timerId = 0;
  let failWrite = false;
  global.localStorage = {
    getItem: key => { if (failRead) throw new Error('Read denied'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (failWrite) throw new Error('Quota exceeded'); writes.push([key, value]); storage.set(key, value); },
  };
  global.window = {
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
  };
  const hooks = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in states)) states[slot] = typeof initial === 'function' ? initial() : initial;
      return [states[slot], next => { states[slot] = typeof next === 'function' ? next(states[slot]) : next; }];
    },
    useEffect(setup, deps) {
      const slot = cursor++;
      const previous = effects[slot];
      if (!previous || deps.some((value, index) => !Object.is(value, previous.deps[index]))) {
        previous?.cleanup();
        effects[slot] = { setup, deps, cleanup: setup() };
      }
    },
  };
  const { useLocalStorage } = sourceLoader(hooks)('hooks/useLocalStorage.ts');
  return {
    render(initial = sampleSkills, parser = parseStoredSkills, key = STORAGE_KEY) {
      cursor = 0;
      return useLocalStorage(key, initial, parser);
    },
    flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); },
    replayEffects() { effects.forEach(effect => { effect.cleanup(); effect.cleanup = effect.setup(); }); },
    failWrites(value) { failWrite = value; },
    storage, writes,
    close() {
      effects.forEach(effect => effect.cleanup());
      if (previousStorage === undefined) delete global.localStorage; else global.localStorage = previousStorage;
      if (previousWindow === undefined) delete global.window; else global.window = previousWindow;
    },
  };
}

test('missing, invalid JSON, wrong structures, and read failures fall back safely', () => {
  for (const saved of [undefined, '{broken', '{}', 'null', '[{}]', JSON.stringify([{ ...legacy, progress: 101 }])]) {
    const h = harness(saved);
    try { assert.deepEqual(h.render()[0], sampleSkills); } finally { h.close(); }
  }
  const h = harness('[]', true);
  try { assert.deepEqual(h.render()[0], sampleSkills); } finally { h.close(); }
});

test('legacy data normalizes optional fields and valid empty arrays remain empty', () => {
  const h = harness(JSON.stringify([legacy]));
  try {
    const [skills] = h.render();
    assert.equal(skills[0].name, 'React');
    assert.deepEqual(skills[0].topics, []);
    assert.equal(skills[0].notes, '');
    assert.equal(skills[0].targetDate, undefined);
  } finally { h.close(); }
  const empty = harness('[]');
  try { assert.deepEqual(empty.render()[0], []); } finally { empty.close(); }
});

test('skill parser preserves current fields and sanitizes malformed optional fields', () => {
  const topic = { id: 2, name: 'Generics', completed: true };
  const current = { ...legacy, progress: 100, topics: [topic, topic, {}], notes: 'Notes', goal: 'Build an app', targetDate: '2026-10-20' };
  const [skill] = parseStoredSkills([current]);
  assert.equal(skill.completed, true);
  assert.deepEqual(skill.topics, [topic]);
  assert.equal(skill.notes, current.notes);
  assert.equal(skill.goal, current.goal);
  assert.equal(skill.targetDate, current.targetDate);
  const [sanitized] = parseStoredSkills([{ ...legacy, topics: {}, notes: 1, goal: false, targetDate: 42 }]);
  assert.deepEqual(sanitized.topics, []);
  assert.equal(sanitized.notes, '');
  assert.equal(sanitized.goal, undefined);
  assert.equal(sanitized.targetDate, undefined);
  assert.throws(() => parseStoredSkills([legacy, legacy]));
  assert.throws(() => parseStoredSkills([{ ...legacy, level: 'Expert' }]));
  assert.throws(() => parseStoredSkills([{ ...legacy, id: -1 }]));
});

test('generic hook supports validated strings and numbers', () => {
  for (const initial of ['', 0]) {
    const h = harness();
    const parser = value => {
      if (typeof value !== typeof initial) throw new TypeError('Wrong type');
      return value;
    };
    try {
      const next = typeof initial === 'string' ? 'TypeScript' : 42;
      const [, setValue] = h.render(initial, parser, 'example');
      setValue(next);
      assert.equal(h.render(initial, parser, 'example')[0], next);
      h.flush();
      assert.equal(h.storage.get('example'), JSON.stringify(next));
      assert.equal(h.writes.length, 1);
    } finally { h.close(); }
  }
});

test('add/edit/progress/topics/notes/goal/date/delete updates persist and restore', () => {
  const h = harness('[]');
  let persisted;
  try {
    let [, setSkills] = h.render();
    const changes = [
      current => [...current, { ...legacy, name: 'React' }],
      current => current.map(skill => ({ ...skill, name: 'React TS' })),
      current => current.map(skill => ({ ...skill, progress: 100, completed: true })),
      current => current.map(skill => ({ ...skill, topics: [{ id: 2, name: 'Generics', completed: false }] })),
      current => current.map(skill => ({ ...skill, topics: skill.topics.map(topic => ({ ...topic, completed: true })) })),
      current => current.map(skill => ({ ...skill, notes: 'Learned generics' })),
      current => current.map(skill => ({ ...skill, goal: 'Build an app', targetDate: '2026-10-20' })),
    ];
    for (const change of changes) {
      setSkills(change);
      const [skills] = h.render();
      h.flush();
      assert.deepEqual(JSON.parse(h.storage.get(STORAGE_KEY)), skills);
    }
    persisted = h.storage.get(STORAGE_KEY);
    assert.equal(h.writes.length, changes.length);
    setSkills(current => current.filter(skill => skill.id !== 1));
    h.render(); h.flush();
    assert.equal(h.storage.get(STORAGE_KEY), '[]');
  } finally { h.close(); }
  const refreshed = harness(persisted);
  try {
    const [skills] = refreshed.render();
    assert.equal(skills[0].name, 'React TS');
    assert.equal(skills[0].progress, 100);
    assert.equal(skills[0].topics[0].completed, true);
    assert.equal(skills[0].notes, 'Learned generics');
    assert.equal(skills[0].goal, 'Build an app');
    assert.equal(skills[0].targetDate, '2026-10-20');
  } finally { refreshed.close(); }
});

test('effect replay cancels duplicate writes; unrelated renders do not persist again', () => {
  const h = harness('[]');
  try {
    h.render(); h.replayEffects(); h.flush();
    assert.equal(h.writes.length, 1);
    h.render(); h.flush();
    assert.equal(h.writes.length, 1);
  } finally { h.close(); }
});

test('write failure preserves usable state and clears error after successful retry', () => {
  const h = harness('[]');
  try {
    const [, setSkills] = h.render();
    h.failWrites(true); h.flush();
    assert.match(h.render()[2], /could not save changes/);
    setSkills([legacy]); h.render(); h.flush();
    assert.equal(h.render()[0].length, 1);
    h.failWrites(false); setSkills(current => [...current]); h.render(); h.flush();
    assert.equal(h.render()[2], '');
  } finally { h.close(); }
});

test('serialization errors are reported safely', () => {
  const h = harness();
  const cyclic = {}; cyclic.self = cyclic;
  try {
    h.render(cyclic, value => value, 'cyclic'); h.flush();
    assert.match(h.render(cyclic, value => value, 'cyclic')[2], /could not save changes/);
    assert.equal(h.writes.length, 0);
  } finally { h.close(); }
});

test('all sorts, missing/invalid target dates and immutable input', () => {
  const { sortSkills } = load('utils/skillSorting.ts');
  const skills = [
    { ...legacy, id: 1, name: 'React', targetDate: '2026-12-01' },
    { ...legacy, id: 2, name: 'TypeScript', level: 'Beginner', progress: 60 },
    { ...legacy, id: 3, name: 'Docker', level: 'Advanced', progress: 40, targetDate: '2026-10-10' },
    { ...legacy, id: 4, name: 'Invalid', level: 'Beginner', progress: 0, targetDate: '2026-02-30' },
  ];
  const before = JSON.stringify(skills);
  for (const [option, ids] of [['name', [3, 4, 1, 2]], ['progress', [1, 2, 3, 4]], ['level', [2, 4, 1, 3]], ['targetDate', [3, 1, 2, 4]]]) {
    assert.deepEqual(sortSkills(skills, option).map(skill => skill.id), ids);
  }
  assert.equal(JSON.stringify(skills), before);
  assert.deepEqual(sortSkills(skills.filter(skill => skill.name.includes('React') && skill.level === 'Intermediate'), 'progress').map(skill => skill.id), [1]);
  assert.deepEqual(sortSkills([], 'name'), []);
  assert.equal(load('types/Skill.ts').isSortOption('unknown'), false);
});

test('dashboard derives rounded averages from each new skill list', () => {
  const Dashboard = load('components/Dashboard.tsx').default;
  function average(skills) {
    const html = renderToStaticMarkup(React.createElement(Dashboard, { skills }));
    return html.match(/Overall Progress<[/]p><strong>([0-9]+)%/)[1];
  }
  const skills = [80, 60, 40].map((progress, index) => ({ ...legacy, id: index + 1, progress }));
  assert.equal(average([]), '0');
  assert.equal(average(skills), '60');
  assert.equal(average([{ ...skills[0], progress: 100 }, ...skills.slice(1)]), '67');
  assert.equal(average(skills.slice(0, 2)), '70');
  assert.equal(average([...skills, { ...legacy, id: 4, progress: 100 }]), '70');
});

test('details route retains topics, notes, goals, dates and route validation', () => {
  const SkillDetails = load('pages/SkillDetails.tsx').default;
  const { Routes, Route } = require('react-router-dom');
  const skill = { ...legacy, name: 'React', topics: [{ id: 2, name: 'Generics', completed: true }], notes: 'Saved notes', goal: 'Build an app', targetDate: '2026-10-20' };
  function render(url) {
    return renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [url] },
      React.createElement(Routes, null, React.createElement(Route, { path: '/skills/:id', element: React.createElement(SkillDetails, { skills: [skill], onUpdate() {} }) }))));
  }
  const html = render('/skills/1');
  for (const text of ['React', 'Generics', 'Saved notes', 'Build an app', '2026-10-20', 'Target Date', 'Status']) assert.ok(html.includes(text));
  assert.ok(render('/skills/invalid').includes('Skill not found'));
  assert.ok(render('/skills/999').includes('Skill not found'));
});

// Exercise metadata effects against a minimal head DOM, using the real pages/hooks.
function metadataDocument() {
  const previous = global.document;
  const elements = [];
  global.document = {
    title: '',
    head: {
      querySelector(selector) {
        assert.equal(selector, 'meta[name="description"]');
        return elements.find(element => element.name === 'description') ?? null;
      },
      appendChild(element) { elements.push(element); },
    },
    createElement(tag) { assert.equal(tag, 'meta'); return { name: '', content: '' }; },
  };
  return {
    elements,
    close() { if (previous === undefined) delete global.document; else global.document = previous; },
  };
}

test('description hook creates once, reuses existing tag, updates dependencies and tolerates effect replay', () => {
  const h = metadataDocument();
  let previousDeps;
  let setup;
  const metadataLoad = sourceLoader({ ...React, useEffect(callback, deps) {
    if (!previousDeps || deps.some((value, index) => value !== previousDeps[index])) {
      previousDeps = deps;
      setup = callback;
      callback();
    }
  } });
  const { useMetaDescription } = metadataLoad('hooks/useMetaDescription.ts');
  try {
    useMetaDescription('Dashboard');
    const original = h.elements[0];
    setup();
    useMetaDescription('React details');
    assert.equal(original.content, 'React details');
    assert.equal(h.elements.length, 1);
    assert.equal(h.elements[0], original);
    useMetaDescription('Dashboard');
    assert.equal(original.content, 'Dashboard');
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    assert.equal((html.match(/<meta\s+name="description"/g) ?? []).length, 1);
  } finally { h.close(); }
});

test('route pages update one description and retain their dynamic titles', () => {
  const h = metadataDocument();
  const metadataLoad = sourceLoader({ ...React, useEffect(callback) { callback(); } });
  const Dashboard = metadataLoad('components/Dashboard.tsx').default;
  const SkillDetails = metadataLoad('pages/SkillDetails.tsx').default;
  const NotFound = metadataLoad('pages/NotFound.tsx').default;
  const { Routes, Route } = require('react-router-dom');
  const skills = ['React', 'TypeScript', 'Docker', 'React <Advanced> & "Hooks"'].map((name, index) => ({ ...legacy, id: index + 1, name }));
  function render(url, currentSkills = skills) {
    renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [url] },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/', element: React.createElement(Dashboard, { skills: currentSkills }) }),
        React.createElement(Route, { path: '/skills/:id', element: React.createElement(SkillDetails, { skills: currentSkills, onUpdate() {} }) }),
        React.createElement(Route, { path: '*', element: React.createElement(NotFound) }))));
  }
  function check(title, description) {
    assert.equal(global.document.title, 'Developer Learning Tracker | ' + title);
    assert.equal(h.elements.length, 1);
    assert.equal(h.elements[0].content, description);
  }
  try {
    render('/');
    check('Dashboard', 'Track developer skills, monitor learning progress, manage goals, and organize your development journey.');
    const original = h.elements[0];
    for (const skill of skills) {
      render('/skills/' + skill.id);
      check(skill.name, `View your ${skill.name} learning progress, topics, notes, goals, and target date.`);
    }
    render('/skills/1', [{ ...skills[0], name: 'Renamed React' }]);
    check('Renamed React', 'View your Renamed React learning progress, topics, notes, goals, and target date.');
    for (const id of ['99999', 'invalid', '0', '9007199254740992']) {
      render('/skills/' + id);
      check('Skill Not Found', 'The requested skill could not be found in Developer Learning Tracker.');
    }
    render('/unknown');
    check('Page Not Found', 'The requested page could not be found in Developer Learning Tracker.');
    render('/');
    check('Dashboard', 'Track developer skills, monitor learning progress, manage goals, and organize your development journey.');
    assert.equal(h.elements[0], original);
  } finally { h.close(); }
});
