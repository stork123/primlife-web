// ES module shim — re-exports CommonJS modules for esbuild bundling
// This lets Capacitor/Android load the same sim.js/genotype.js/etc code
import { Environment, Vector, Biot, SCALE, GROW, RECALCULATE, REFORM, NORMAL } from './sim.js';
import * as G from './genotype.js';
import Sounds from './sounds.js';
import { PEN_COLORS } from './ui-colors.js';
import { BiotEditor } from './editor.js';
import { Guide } from './guide.js';

export { Environment, Vector, Biot, SCALE, GROW, RECALCULATE, REFORM, NORMAL, G, Sounds, PEN_COLORS, BiotEditor, Guide };
