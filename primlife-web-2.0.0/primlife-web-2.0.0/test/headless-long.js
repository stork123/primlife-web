// Longer test to reproduce the "stops moving after a minute" freeze
'use strict';
const { Environment } = require('../src/sim.js');

const env = new Environment(1280, 800, 42, { initialPopulation: 30 });
console.log('Start: pop=', env.biots.length);

let lastMoving = Infinity, lastTick = 0, stall = 0;
let startTime = Date.now();

for (let tick = 1; tick <= 100000; tick++) {
  env.step();
  const pop = env.biots.length;
  
  if (tick % 1000 === 0) {
    let moving = 0, nan = 0;
    for (const b of env.biots) {
      if (!Number.isFinite(b.energy) || !Number.isFinite(b.vector.x) || !Number.isFinite(b.vector.y)) nan++;
      if (Math.abs(b.vector.dx) > 0.001 || Math.abs(b.vector.dy) > 0.001) moving++;
    }
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`t=${tick} pop=${pop} births=${env.stats.births} deaths=${env.stats.deaths} moving=${moving} nan=${nan} ${elapsed.toFixed(1)}s`);
    
    if (nan > 0) { console.error('FAIL: NaN detected'); process.exit(1); }
    if (pop === 0) { console.error('FAIL: extinction'); process.exit(1); }
    if (moving === 0) { stall++; } else { stall = 0; lastMoving = tick; }
    
    if (stall > 3) { 
      console.error('FAIL: sim frozen (no moving biots) at tick', tick); 
      process.exit(1); 
    }
    if (elapsed > 45) { console.error('FAIL: timeout (>45s)'); process.exit(1); }
  }
}
console.log('PASS: ran 100k ticks');
console.log('Final pop:', env.biots.length, 'births:', env.stats.births);
