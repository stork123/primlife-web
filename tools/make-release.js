// create GitHub release and upload the portable exe
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const cred = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = cred.match(/^password=(.+)$/m)[1].trim();
const OWNER = 'stork123', REPO = 'primlife-web';

function api(method, host, path, body, contentType) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Authorization': 'token ' + token,
      'User-Agent': 'primlife-publish',
      'Accept': 'application/vnd.github+json'
    };
    if (body) {
      headers['Content-Type'] = contentType || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = https.request({ hostname: host, path, method, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) req.end(body); else req.end();
  });
}

(async () => {
  const rel = await api('POST', 'api.github.com', `/repos/${OWNER}/${REPO}/releases`, JSON.stringify({
    tag_name: 'v1.0.0',
    name: 'Primordial Life 1.0.0',
    body: 'Portable Windows executable — no installation or registration required.\n\n' +
      'Download `Primordial.Life.1.0.0.exe`, run it, watch evolution happen.\n\n' +
      'Controls: Space=pause, R=restart, +/-=speed, click=inspect biot, F11=fullscreen, Esc=quit.',
    draft: false, prerelease: false
  }));
  console.log('release:', rel.status, rel.json.html_url || rel.json.message);
  if (rel.status !== 201) return;
  const exePath = 'release/Primordial Life 1.0.0.exe';
  const buf = fs.readFileSync(exePath);
  console.log('uploading exe,', (buf.length / 1048576).toFixed(1), 'MB...');
  const up = await api('POST', 'uploads.github.com',
    `/repos/${OWNER}/${REPO}/releases/${rel.json.id}/assets?name=${encodeURIComponent('Primordial.Life.1.0.0.exe')}`,
    buf, 'application/octet-stream');
  console.log('asset:', up.status, up.json.browser_download_url || up.json.message);
})().catch(e => { console.error(e); process.exit(1); });
