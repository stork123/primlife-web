// Build script for web/Android bundle
// Bundles all CommonJS modules into a single IIFE file for Capacitor/browser
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/render.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: 'src/render.bundle.js',
  // Mark Node.js builtins as external — esbuild won't try to resolve them
  // At runtime in web/Capacitor, require('fs') hits our injected stub
  external: ['fs', 'path'],
  // Inject runtime stubs BEFORE the bundle code runs
  inject: [require.resolve('./stub-node.js')],
}).then(() => {
  console.log('✓ Bundle created: src/render.bundle.js');
}).catch((error) => {
  console.error('✗ Build failed:', error);
  process.exit(1);
});
