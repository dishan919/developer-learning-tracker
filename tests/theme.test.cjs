const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');

function harness(saved, blocked = false) {
  let state;
  let initialized = false;
  let effect;
  let value;
  const storage = new Map([['skills', 'preserved']]);
  if (saved !== undefined) storage.set('developer-learning-tracker-theme', saved);
  const previous = { localStorage: global.localStorage, document: global.document };
  global.localStorage = {
    getItem(key) { if (blocked) throw Error('denied'); return storage.get(key) ?? null; },
    setItem(key, next) { if (blocked) throw Error('denied'); storage.set(key, next); },
  };
  global.document = { documentElement: { dataset: {} } };
  const hooks = {
    ...React,
    useState(initial) {
      if (!initialized) { state = initial(); initialized = true; }
      return [state, next => { state = next(state); }];
    },
    useEffect(callback) { effect = callback; },
    useContext() { return value; },
  };
  const output = ts.transpileModule(fs.readFileSync('src/context/ThemeContext.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(name => name === 'react' ? hooks : require(name), module, module.exports);
  return {
    render() {
      value = module.exports.ThemeProvider({ children: null }).props.value;
      effect();
      return module.exports.useTheme();
    },
    outside() { value = undefined; return module.exports.useTheme(); },
    storage,
    close() {
      for (const [key, original] of Object.entries(previous)) {
        if (original === undefined) delete global[key]; else global[key] = original;
      }
    },
  };
}

test('theme validates saved values, defaults safely, and preserves other storage', () => {
  for (const saved of [undefined, 'light', 'dark', 'invalid', 'null', '"dark"']) {
    const h = harness(saved);
    try {
      const expected = saved === 'dark' ? 'dark' : 'light';
      assert.equal(h.render().theme, expected);
      assert.equal(global.document.documentElement.dataset.theme, expected);
      assert.equal(h.storage.get('developer-learning-tracker-theme'), expected);
      assert.equal(h.storage.get('skills'), 'preserved');
    } finally { h.close(); }
  }
});

test('toggle synchronizes DOM and storage, persists after remount, and guards missing provider', () => {
  const h = harness();
  try {
    h.render().toggleTheme();
    assert.equal(h.render().theme, 'dark');
    assert.equal(global.document.documentElement.dataset.theme, 'dark');
    assert.equal(h.storage.get('developer-learning-tracker-theme'), 'dark');
    const reloaded = harness(h.storage.get('developer-learning-tracker-theme'));
    try { assert.equal(reloaded.render().theme, 'dark'); } finally { reloaded.close(); }
    h.render().toggleTheme();
    assert.equal(h.render().theme, 'light');
    assert.equal(global.document.documentElement.dataset.theme, 'light');
    assert.throws(() => h.outside(), /within a ThemeProvider/);
  } finally { h.close(); }
});

test('unavailable storage still allows theme switching', () => {
  const h = harness(undefined, true);
  try {
    assert.equal(h.render().theme, 'light');
    h.render().toggleTheme();
    assert.equal(h.render().theme, 'dark');
  } finally { h.close(); }
});
