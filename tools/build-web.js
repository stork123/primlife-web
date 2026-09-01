// Build script for web/Android bundle
// Bundles all source into a clean www/ directory for Capacitor
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW_DIR = path.join(ROOT, 'www');

// Create www/ directory
fs.rmSync(WWW_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(WWW_DIR, 'sounds'), { recursive: true });
fs.mkdirSync(path.join(WWW_DIR, 'docs'), { recursive: true });

// Bundle all CommonJS into a single IIFE
esbuild.build({
  entryPoints: ['src/render.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: path.join(WWW_DIR, 'render.bundle.js'),
  external: ['fs', 'path'],
  inject: [path.join(__dirname, 'stub-node.js')],
  logLevel: 'info',
}).then(() => {
  // Copy assets
  fs.copyFileSync(path.join(ROOT, 'src', 'sounds', 'birth.wav'), path.join(WWW_DIR, 'sounds', 'birth.wav'));
  fs.copyFileSync(path.join(ROOT, 'docs', 'BIOT-GUIDE.md'), path.join(WWW_DIR, 'docs', 'BIOT-GUIDE.md'));

  // Write Capacitor-friendly index.html that points to the bundle
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Primordial Life</title>
<style>
  html, body { margin: 0; padding: 0; background: #000; overflow: hidden; height: 100%; width: 100%; }
  canvas { display: block; width: 100vw; height: 100vh; }
  #hud { position: fixed; top: 8px; left: 10px; color: #0f0; z-index: 5; font: 12px "Courier New", monospace; text-shadow: 0 0 4px #0f0; background: rgba(0,0,0,0.55); padding: 6px 10px; border: 1px solid #030; pointer-events: none; white-space: pre; }
  #inspector { position: fixed; top: 8px; right: 10px; color: #6ff; z-index: 5; font: 12px "Courier New", monospace; background: rgba(0,0,0,0.7); padding: 6px 10px; border: 1px solid #033; white-space: pre; display: none; }
  #help { position: fixed; bottom: 8px; left: 10px; color: #666; z-index: 5; font: 11px "Courier New", monospace; }
  #controls { position: fixed; bottom: 8px; right: 10px; z-index: 10; display: flex; gap: 6px; flex-wrap: wrap; pointer-events: auto; user-select: none; }
  #controls button, #controls .pad { background: #111; color: #cfc; border: 1px solid #0f0; font: 12px "Courier New", monospace; padding: 6px 8px; cursor: pointer; touch-action: manipulation; }
  #controls button:active, #controls .pad:active { background: #030; color: #000; }
  #controls .pad { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
</style>
</head>
<body>
<canvas id="world"></canvas>
<div id="hud"></div>
<div id="inspector"></div>
<div id="help">Tap biot to inspect | Double-tap to release editor | Tap controls below</div>
<div id="controls">
  <button id="btn-pause">⏸</button>
  <button id="btn-restart">⟲</button>
  <button id="btn-sound">🔊</button>
  <button id="btn-guide">📖</button>
  <button id="btn-editor">✏️</button>
  <div class="pad" id="pad-up">▲</div>
  <div class="pad" id="pad-left">◀</div>
  <div class="pad" id="pad-down">▼</div>
  <div class="pad" id="pad-right">▶</div>
</div>
<script src="render.bundle.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(WWW_DIR, 'index.html'), indexHtml);

  console.log('✓ Web build ready at', WWW_DIR);
  console.log('  - render.bundle.js (bundled sim)');
  console.log('  - sounds/birth.wav');
  console.log('  - docs/BIOT-GUIDE.md');
}).catch((error) => {
  console.error('✗ Build failed:', error);
  process.exit(1);
});
