// Canvas2D renderer + main loop for Primordial Life
'use strict';
const { Environment } = require('./sim.js');
const G = require('./genotype.js');
const Sounds = require('./sounds.js');

const { PEN_COLORS } = require('./ui-colors.js');
const { Guide } = require('./guide.js');

const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const inspector = document.getElementById('inspector');

let env = null;
let paused = false;
let stepsPerFrame = 1;
let selected = null;
let guide;
try { guide = new Guide(); }
catch (e) { console.error('Guide failed to initialize:', e); guide = { visible: false, toggle() {}, hide() {} }; }

// safe newWorld: if it throws, the sim stops but the app doesn't crash
let newWorldSafe = function() {
  try {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    env = new Environment(canvas.width, canvas.height, (Date.now() & 0x7fffffff), { initialPopulation: 20 });
    env.on('birth', () => { try { Sounds.birth(); } catch(e) { console.error('birth sound failed:', e); } });
    env.on('mate', () => Sounds.mate());
    env.on('eaten', () => Sounds.eaten());
    env.on('noEnergy', () => Sounds.noEnergy());
    env.on('tooOld', () => Sounds.tooOld());
    env.on('extinction', () => Sounds.extinction());
    Sounds.start();
    selected = null;
    inspector.style.display = 'none';
  } catch (e) {
    console.error('newWorld failed:', e);
    const err = document.getElementById('inspector');
    if (err) err.textContent = 'RESTART FAILED: ' + e.message;
  }
};

function newWorld() { newWorldSafe(); }

window.addEventListener('resize', () => {
  // preserve population, resize world
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (env) { env.width = canvas.width; env.height = canvas.height; }
});

// Start the simulation
newWorld();

window.addEventListener('keydown', (e) => {
  // Don't let hotkeys fire when typing into inputs / selects / textareas
  const tag = (e.target.tagName || '').toUpperCase();
  if (['INPUT','SELECT','TEXTAREA'].includes(tag) || e.target.isContentEditable) return;
  if (e.code === 'Space') { paused = !paused; e.preventDefault(); }
  else if (e.key === 'r' || e.key === 'R') newWorld();
  else if (e.key === 's' || e.key === 'S') Sounds.toggle();
  else if (e.key === 'g' || e.key === 'G') guide.toggle();
  else if (e.key === 'Escape') { if (guide.visible) guide.hide(); }
  else if (e.key === '+' || e.key === '=') stepsPerFrame = Math.min(16, stepsPerFrame + 1);
  else if (e.key === '-') stepsPerFrame = Math.max(1, stepsPerFrame - 1);
});

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  selected = null;
  for (const b of env.biots) {
    if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) { selected = b; break; }
  }
  if (!selected) inspector.style.display = 'none';
});

// --- Android / touch controls ---
// Map on-screen buttons to the same logic as keyboard handlers
['btn-pause','btn-restart','btn-sound','btn-guide'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', (e) => {
    e.preventDefault();
    switch(id) {
      case 'btn-pause': paused = !paused; break;
      case 'btn-restart': newWorld(); break;
      case 'btn-sound': Sounds.toggle(); updateSoundBtn(); break;
      case 'btn-guide': guide.toggle(); break;
    }
  });
});

function updateSoundBtn() {
  const btn = document.getElementById('btn-sound');
  if (btn) btn.textContent = Sounds.isEnabled() ? '🔊' : '🔇';
}

function drawBiot(b) {
  const sick = b.nSick > 0;
  let lastColor = -1;
  for (let i = 0; i < b.genes; i++) {
    if (b.state[i] <= 0) continue;
    let pen = sick ? G.PURPLE_LEAF : b.nType[i];
    if (!sick && b.state[i] !== b.distance[i]) pen += G.DIM_COLOR; // injured segment = dark shade
    if (pen >= PEN_COLORS.length) pen = G.GREY_LEAF;
    if (pen !== lastColor) { ctx.strokeStyle = PEN_COLORS[pen]; lastColor = pen; }
    ctx.beginPath();
    ctx.moveTo(b.x1(i) + 0.5, b.y1(i) + 0.5);
    ctx.lineTo(b.x2(i) + 0.5, b.y2(i) + 0.5);
    ctx.stroke();
  }
  if (b === selected) {
    ctx.strokeStyle = '#808080';
    ctx.strokeRect(b.left - 2, b.top - 2, b.width() + 4, b.height() + 4);
  }
}

function updateInspector() {
  if (!selected) return;
  if (!env.biots.includes(selected)) { selected = null; inspector.style.display = 'none'; return; }
  const b = selected;
  inspector.style.display = 'block';
  inspector.textContent =
    `Biot: ${b.name}:${b.generation}\n` +
    `sex: ${b.trait.isMale() ? 'male' : 'female'}${b.trait.isAsexual() ? ' (asexual)' : ''}\n` +
    `species: ${b.trait.getSpecies()}  limbs: ${b.trait.getLines()}${b.trait.isMirrored() ? ' mirrored' : ''}\n` +
    `age: ${b.age} / ${b.maxAge}\n` +
    `energy: ${Math.round(b.percentEnergy())}%  ratio: ${b.ratio}\n` +
    `children: ${b.trait.getNumberOfChildren()}  fertilized: ${b.genes2 ? 'yes' : 'no'}\n` +
    `green: ${b.colorDistance[0]}  red: ${b.colorDistance[2]}\n` +
    `blue: ${b.colorDistance[1]}  white: ${b.colorDistance[4]}  lblue: ${b.colorDistance[3]}` +
    (b.nSick ? '\n** SICK **' : '');
}

function frame() {
  try {
    if (!paused) for (let s = 0; s < stepsPerFrame; s++) env.step();
  } catch (e) {
    console.error('frame step error:', e);
    paused = true;
  }
  try {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;
  for (const b of env.biots) drawBiot(b);
  } catch (e) { console.error('draw error:', e); }
  hud.textContent =
    `Primordial Life  |  pop ${env.biots.length}  gen ${env.stats.generation}\n` +
    `births ${env.stats.births}  deaths ${env.stats.deaths}  extinctions ${env.stats.extinctions}` +
    (Sounds.isEnabled() ? '' : '  [MUTED]') +
    (paused ? '  [PAUSED]' : (stepsPerFrame > 1 ? `  x${stepsPerFrame}` : ''));
  updateInspector();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
