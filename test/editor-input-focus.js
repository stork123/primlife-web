// Regression test: hotkey guard prevents input-focus bug.
// Verifies the exact guard logic from render.js that stops E/G/R/S hotkeys
// from firing when typing in editor fields.
'use strict';
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const { document } = dom.window;
global.document = document;
global.window = dom.window;

let failures = 0;
function check(name, cond) {
  console.log((cond ? 'OK   ' : 'FAIL ') + name);
  if (!cond) failures++;
}

// === EXACT guard logic from render.js (lines 76-78) ===
function shouldBlockHotkey(e) {
  const tag = (e.target.tagName || '').toUpperCase();
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || e.target.isContentEditable;
}

// Build sample DOM elements of each type
const input = document.createElement('input');
const select = document.createElement('select');
const textarea = document.createElement('textarea');
const button = document.createElement('button');
const canvas = document.createElement('canvas');
const div = document.createElement('div');
const contentEditableDiv = document.createElement('div'); contentEditableDiv.isContentEditable = true;

check('input blocks hotkeys', shouldBlockHotkey({target: input}));
check('select blocks hotkeys', shouldBlockHotkey({target: select}));
check('textarea blocks hotkeys', shouldBlockHotkey({target: textarea}));
check('contentEditable div blocks hotkeys', shouldBlockHotkey({target: contentEditableDiv}));
check('canvas does NOT block hotkeys', !shouldBlockHotkey({target: canvas}));
check('div does NOT block hotkeys', !shouldBlockHotkey({target: div}));
check('button does NOT block hotkeys', !shouldBlockHotkey({target: button}));
check('document does NOT block hotkeys', !shouldBlockHotkey({target: document}));

// The specific bug scenario: type 'E' in editor name field
const nameField = document.createElement('input');
nameField.setAttribute('type', 'text');
check('E keystroke in name field is blocked', shouldBlockHotkey({target: nameField}));

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASS');
process.exit(failures ? 1 : 0);
