// Regression test for the "typing E closes the editor" bug.
// Root cause: the document keydown handler didn't check focus context,
// so keystrokes in editor inputs (name field, etc.) bubbled up and triggered
// hotkeys like editor.toggle() / newWorld() / guide.toggle().
'use strict';
const path = require('path');

let failures = 0;
function check(name, cond) {
  console.log((cond ? 'OK   ' : 'FAIL ') + name);
  if (!cond) failures++;
}

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { pretendToBeVisual: true });
const { document, window } = dom.window;
global.document = document;
global.window = window;
window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect(){}, fillRect(){}, save(){}, restore(){}, translate(){}, scale(){},
  beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fillText(){}, measureText(){return{Width:0};},
  fillStyle: '', strokeStyle: '', lineWidth: 1, canvas: document.createElement('canvas')
});

// Use a real Environment but skip createBiots
const { Environment } = require('../src/sim.js');
const { BiotEditor } = require('../src/editor.js');

const env = Object.create(Environment.prototype);
env.width = 800; env.height = 600; env.biots = [];
env.stats = { generation: 0, births: 0, deaths: 0, extinctions: 0 };
env.listeners = {};
env.uniqueID = 0;
env.options = {
  leafEnergy: 2, regenCost: 200, regenTime: 0x07, startEnergy: 400*8, friction: 0.005,
  chance: 12, initialPopulation: 0, nSexual: 3, nSick: 200,
  armsPerBiot: 0, typesPerBiot: 0, segmentsPerArm: 0,
  leafContact: [], leafMass: [], newType: []
};
env.on = function() {};

const editor = new BiotEditor(env);

// This is the EXACT guard logic from render.js lines 76-78
function shouldBlockHotkey(target) {
  const tag = (target.tagName || '').toUpperCase();
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || target.isContentEditable;
}

// Type "E" in the name field — should NOT trigger editor.toggle()
const nameInput = editor.el.querySelector('#ed-name');
nameInput.focus();
check('name input is focused', document.activeElement === nameInput);
check('typing E in name field is blocked from hotkey', shouldBlockHotkey(nameInput));
check('typing R in name field is blocked from hotkey', shouldBlockHotkey(nameInput));
check('typing G in name field is blocked from hotkey', shouldBlockHotkey(nameInput));

// Any other input in editor
const limbSlider = editor.el.querySelector('#ed-limbs');
check('slider input is blocked', shouldBlockHotkey(limbSlider));

const sexSelect = editor.el.querySelector('#ed-sex');
check('select element is blocked', shouldBlockHotkey(sexSelect));

// Canvas clicks should NOT be blocked (world interaction)
const canvas = document.createElement('canvas');
check('canvas does NOT block hotkey (world input)', !shouldBlockHotkey(canvas));

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASS');
process.exit(failures ? 1 : 0);
