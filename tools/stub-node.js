// Runtime stub for Node.js builtins in browser/Capacitor builds
// Only fs and path are used, and only in Electron (guarded by isElectron checks)
// This ensures require() always returns something instead of crashing
var __originalRequire = typeof require !== 'undefined' ? require : null;

globalThis.require = function(name) {
  if (typeof __originalRequire === 'function') {
    try { return __originalRequire(name); } catch (e) {
      // In web context, native module resolution fails — fall through to stubs
    }
  }
  if (name === 'fs') return {};
  if (name === 'path') return {
    join: function() { return Array.prototype.join.call(arguments, '/'); },
    resolve: function() { return Array.prototype.join.call(arguments, '/'); },
    basename: function(p) { return p.split('/').pop(); },
    dirname: function(p) { return p.split('/').slice(0, -1).join('/'); },
  };
  return {};
};

// Also handle process.env which esbuild may reference
if (typeof process === 'undefined' || !process.env) {
  globalThis.process = { env: {} };
}
