// Smoke test: construct BiotEditor in a jsdom DOM and exercise its methods.
// Reproduces the "editor silently missing" bug — any throw here is the real cause.
'use strict';
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="world"></canvas></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.FileReader = dom.window.FileReader;
global.Blob = dom.window.Blob;
global.URL = dom.window.URL;
global.alert = (m) => console.log('[alert]', m);

// jsdom canvas has no 2d context without the optional `canvas` pkg — stub it
const ctxStub = () => new Proxy({}, { get: (t, p) => (p === 'canvas' ? null : () => {}) , set: () => true });
dom.window.HTMLCanvasElement.prototype.getContext = function () { return ctxStub(); };

const { Environment } = require('../src/sim.js');
const { BiotEditor } = require('../src/editor.js');

const env = new Environment(1280, 800, 12345, { initialPopulation: 5 });

let failures = 0;
function step(name, fn) {
  try { fn(); console.log('OK  ', name); }
  catch (e) { failures++; console.log('FAIL', name, '->', e.message); console.log(e.stack.split('\n').slice(0, 4).join('\n')); }
}

let editor;
step('construct BiotEditor', () => {
  editor = new BiotEditor(env, () => {});
});
if (editor) {
  step('show()', () => editor.show());
  step('randomize()', () => editor.randomize());
  step('syncFromUi()', () => editor.syncFromUi());
  step('makeBiot()', () => {
    const b = editor.makeBiot();
    if (!b || !b.genes) throw new Error('biot has no genes');
    console.log('     biot genes:', b.genes, 'name:', b.name);
  });
  step('release()', () => editor.release());
  step('serialize/deserialize roundtrip', () => {
    const data = editor.serializeTrait(editor.trait);
    const t2 = editor.deserializeTrait(JSON.parse(JSON.stringify(data)));
    if (t2.lineCount !== editor.trait.lineCount) throw new Error('lineCount mismatch');
  });
  step('hide()', () => editor.hide());
}
console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASS');
process.exit(failures ? 1 : 0);
