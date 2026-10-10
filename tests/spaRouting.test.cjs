const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const fallback = fs.readFileSync('public/404.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const compiled = ts.transpileModule(fs.readFileSync('src/utils/spaRouting.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function restore(url, base = '/developer-learning-tracker/') {
  const location = new URL(url);
  let restored;
  const state = { existing: true };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: module.exports, URL, URLSearchParams,
    window: { location, history: { state, replaceState(nextState, title, target) {
      assert.equal(nextState, state);
      restored = target;
    } } },
  });
  module.exports.restoreSpaRoute(base);
  return restored;
}

test('Pages fallback round-trips details, unknown routes, encoded paths, queries and hashes', () => {
  for (const route of [
    '/developer-learning-tracker/skills/1',
    '/developer-learning-tracker/this-page-does-not-exist',
    '/developer-learning-tracker/skills/1?q=a%26b&next=%2Ftest&__spa=original#notes',
    '/developer-learning-tracker/a%20b?x=1&x=2#topic%20one',
  ]) {
    const location = new URL('https://dishan919.github.io' + route);
    let redirect;
    location.replace = target => { redirect = target; };
    vm.runInNewContext(fallback, { window: { location } });
    assert.ok(redirect.startsWith('/developer-learning-tracker/?__spa='));
    assert.equal(restore('https://dishan919.github.io' + redirect), route);
  }
});

test('fallback does not loop at app root or 404 document and supports another repository name', () => {
  for (const pathname of ['/developer-learning-tracker/', '/developer-learning-tracker/404.html']) {
    vm.runInNewContext(fallback, { window: { location: { pathname, replace() { assert.fail('redirect loop'); } } } });
  }
  let redirect;
  vm.runInNewContext(fallback, { window: { location: {
    pathname: '/another-repo/skills/1', search: '', hash: '', replace(target) { redirect = target; },
  } } });
  assert.equal(restore('https://example.com' + redirect, '/another-repo/'), '/another-repo/skills/1');
});

test('restoration ignores normal URLs and unsafe or outside-base destinations', () => {
  for (const target of ['https://evil.example/path', '//evil.example/path', '/other/skills/1',
    '/developer-learning-tracker/../../other', '/developer-learning-tracker/..%2Fother']) {
    const result = restore('https://dishan919.github.io/developer-learning-tracker/?__spa=' + encodeURIComponent(target));
    if (result !== undefined) assert.ok(result.startsWith('/developer-learning-tracker/'));
  }
  assert.equal(restore('https://dishan919.github.io/developer-learning-tracker/'), undefined);
  assert.equal(restore('https://dishan919.github.io/developer-learning-tracker/skills/1?__spa=ignored'), undefined);
  assert.equal(restore('http://localhost:5173/'), undefined);
});
