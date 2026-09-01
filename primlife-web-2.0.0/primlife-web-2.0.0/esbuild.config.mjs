// esbuild config — bundle for Capacitor/web (browser target, no Node APIs)
// Usage: npx esbuild src/render.js --config esbuild.config.mjs --platform=browser
// or just run: node build-web.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/render.js'],
  outfile: 'src/render.bundle.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  define: {
    // Stub out Node built-ins that get bundled
    __dirname: '""',
  },
  logLevel: 'info'
}).catch(() => process.exit(1));
