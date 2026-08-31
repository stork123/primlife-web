// WebAudio sound effects for Primordial Life events.
// Birth sound replaced with babycry.wav; others remain synthesized blips.
'use strict';
const fs = require('fs');
const path = require('path');

let ctx = null;
let enabled = true;
let lastPlay = {};
const buffers = {};

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// preload WAV
['birth.wav'].forEach(file => {
  const p = path.join(__dirname, '..', 'sounds', file);
  buffers[file] = fs.readFileSync(p);
});

// f0->f1 sweep, given wave/duration/volume
function blip(name, f0, f1, dur, type, vol, throttleMs) {
  if (!enabled) return;
  const now = Date.now();
  if (throttleMs && lastPlay[name] && now - lastPlay[name] < throttleMs) return;
  lastPlay[name] = now;
  const a = ac(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur);
}

const Sounds = {
  toggle() { enabled = !enabled; return enabled; },
  isEnabled() { return enabled; },
  start()      { blip('start',      220, 880, 0.35, 'triangle', 0.15); },
  birth() {
    if (!enabled) return;
    const a = ac();
    const b = a.createBuffer(1, buffers['birth.wav'].length / 4, 44100);
    b.getChannelData(0).set(new Float32Array(buffers['birth.wav']));
    const s = a.createBufferSource();
    s.buffer = b;
    s.connect(a.destination);
    s.start(a.currentTime);
  },
  mate()       { blip('mate',       660, 990, 0.15, 'sine',     0.10, 150); },
  eaten()      { blip('eaten',      330, 110, 0.10, 'sawtooth', 0.08, 60); },
  noEnergy()   { blip('noEnergy',   220, 55,  0.25, 'triangle', 0.10, 100); },
  tooOld()     { blip('tooOld',     165, 41,  0.40, 'sine',     0.10, 100); },
  extinction() { blip('extinction', 880, 27,  1.20, 'sawtooth', 0.18); }
};

module.exports = Sounds;
