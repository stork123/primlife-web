// Headless simulation test — 5000 ticks, verify population persists & no NaN
'use strict';
const { Environment } = require('../src/sim.js');

const env = new Environment(800, 600, 42, { initialPopulation: 20 });
console.log('Initial population:', env.biots.length);
const b0 = env.biots[0];
console.log('Sample biot:', JSON.stringify({
  name: b0.name, lines: b0.trait.getLines(), mirrored: b0.trait.isMirrored(),
  energy: b0.energy, ratio: b0.ratio, totalDistance: b0.totalDistance,
  mass: b0.vector.mass, rect: [b0.left, b0.top, b0.right, b0.bottom]
}));

let minPop = Infinity, maxPop = 0;
const t0 = Date.now();
for (let tick = 1; tick <= 5000; tick++) {
  env.step();
  const pop = env.biots.length;
  if (pop < minPop) minPop = pop;
  if (pop > maxPop) maxPop = pop;
  if (tick % 500 === 0) {
    // sanity checks
    let bad = 0, moving = 0;
    for (const b of env.biots) {
      if (!Number.isFinite(b.energy) || !Number.isFinite(b.vector.x) || !Number.isFinite(b.vector.y)) bad++;
      if (Math.abs(b.vector.dx) > 0.001 || Math.abs(b.vector.dy) > 0.001) moving++;
    }
    console.log(`tick ${tick}: pop=${pop} births=${env.stats.births} deaths=${env.stats.deaths} ` +
      `extinct=${env.stats.extinctions} collisions=${env.stats.collisionCount} moving=${moving} NaN=${bad}`);
    if (bad > 0) { console.error('FAIL: NaN detected'); process.exit(1); }
  }
}
const dt = (Date.now() - t0) / 1000;
console.log(`\nDone. 5000 ticks in ${dt.toFixed(1)}s (${(5000/dt).toFixed(0)} ticks/s)`);
console.log(`Population range: ${minPop}..${maxPop}, final=${env.biots.length}`);
if (env.biots.length === 0 && env.stats.extinctions > 3) { console.error('FAIL: repeated extinction'); process.exit(1); }
const s = env.biots[0];
if (s) console.log('Survivor sample:', s.name, 'gen', s.generation, 'age', s.age, 'energy', s.energy,
  'lines', s.trait.getLines(), 'greens', s.colorDistance[0], 'reds', s.colorDistance[2]);
console.log('PASS');
