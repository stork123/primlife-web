# Primordial Life (Web / Electron Port)

A modern port of **Primordial Life**, the classic 1995–98 artificial-life screensaver
by Jason Spofford, rewritten in JavaScript and packaged as a portable Windows app
with Electron.

> Your screen becomes a world in which living *biots* survive and multiply.
> Sunlight is transformed into energy by biots with green leaves. Predator biots
> with red teeth feed on green-leafed biots. Biots with blue shields defend against
> the red menace. White-lined biots inject their genetic code into others.
> Evolution unfolds through mutation and crossover, generation after generation.

**[⬇ Download the portable Windows exe](https://github.com/stork123/primlife-web/releases/latest)** — no install needed.

## Features

- Faithful port of the original simulation core from Spofford's GPL source release:
  - **ISAAC RNG** (Bob Jenkins) — same generator as the original
  - **Genotype**: up to 8 limbs (optionally mirrored), 10 segments per limb,
    4 limb types, per-segment color/length/angle genes
  - **Brain**: evolvable sum-of-products logic (256 product terms, 64 sums)
    driving 10 command types — limb flapping is how biots learn to swim
  - **Ecology**: photosynthesis (green), predation (red), shields (blue),
    gene injection / sexual reproduction (white), sickness, regeneration
  - **Physics**: momentum, rotation, elastic collisions, wall bounces
- Canvas2D renderer, HUD with live population stats
- Click any biot to inspect its genome, energy, age, and species
- Runs as a plain web page or a standalone Windows executable

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause / resume |
| `R` | Restart with a fresh random population |
| `+` / `-` | Simulation speed (steps per frame) |
| Click | Inspect a biot |
| `F11` | Fullscreen |
| `Esc` | Quit |

## Running

```bash
npm install
npm start          # run in Electron
npm test           # headless 5000-tick simulation sanity test
npm run dist       # build portable Windows exe into release/
```

## Project layout

```
src/rng.js        ISAAC random number generator
src/genotype.js   GeneSegment / GeneLimb / GeneTrait
src/brain.js      Product terms/sums, command array, limb stores
src/sim.js        Vector physics, Biot, Environment
src/render.js     Canvas2D renderer + input
src/index.html    App shell
electron/main.js  Electron main process
test/headless.js  Headless simulation test
```

## History & License

Primordial Life was shareware for Windows 95/NT, later open-sourced by its author
under the GNU (Affero) GPL. This port derives its simulation logic from that source
release ([jondo/primlife](https://github.com/jondo/primlife)) and is licensed
**AGPL-3.0-or-later** accordingly.

Original: Copyright (C) 1995–1998 Jason Spofford.
Port: 2026.
