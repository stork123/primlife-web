// create GitHub release and upload the portable exe
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const VERSION = pkg.version;
const TAG = `v${VERSION}`;
const EXE_NAME = `Primordial.Life.${VERSION}.exe`;
const EXE_PATH = path.join(__dirname, '..', 'release', EXE_NAME);

const cred = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = cred.match(/^password=(.+)$/m)[1].trim();
const OWNER = 'stork123', REPO = 'primlife-web';

function api(method, host, reqPath, body, contentType) {
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
    const req = https.request({ hostname: host, path: reqPath, method, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) req.end(body); else req.end();
  });
}

(async () => {
  // Check if release already exists
  let rel = await api('GET', 'api.github.com', `/repos/${OWNER}/${REPO}/releases/tags/${TAG}`);

  if (rel.status === 404) {
    // Create new release
    const releaseBody = 'Portable Windows executable — no installation or registration required.\n\n' +
      `Download \`${EXE_NAME}\`, run it, watch evolution happen.\n\n` +
      'Controls: Space=pause, R=restart, +/-=speed, click=inspect biot, F11=fullscreen, Esc=quit.';

    rel = await api('POST', 'api.github.com', `/repos/${OWNER}/${REPO}/releases`, JSON.stringify({
      tag_name: TAG,
      name: `Primordial Life ${VERSION}`,
      body: `**Full Changelog**: https://github.com/${OWNER}/${REPO}/compare/v${pkg.version === '1.4.0' ? '1.3.0' : '1.0.0'}...${TAG}`,
      draft: false, prerelease: false
    }));
    console.log('release:', rel.status, rel.json.html_url || rel.json.message);
    if (rel.status !== 201) return;
  } else if (rel.status === 200) {
    console.log('release already exists:', rel.json.html_url);
  } else {
    console.log('unexpected status:', rel.status, rel.json?.message);
    return;
  }

  // Upload EXE
  if (!fs.existsSync(EXE_PATH)) {
    console.error(`ERROR: ${EXE_PATH} not found. Run 'npm run dist' first.`);
    process.exit(1);
  }
  const buf = fs.readFileSync(EXE_PATH);
  console.log('uploading exe,', (buf.length / 1048576).toFixed(1), 'MB...');

  // Check if asset already exists, delete it first
  const existing = await api('GET', 'api.github.com', `/repos/${OWNER}/${REPO}/releases/tags/${TAG}`);
  if (existing.status === 200) {
    for (const a of existing.json.assets || []) {
      if (a.name === EXE_NAME) {
        await api('DELETE', 'api.github.com', `/repos/${OWNER}/${REPO}/releases/assets/${a.id}`);
        console.log('deleted existing asset:', a.id);
      }
    }
  }

  const up = await api('POST', 'uploads.github.com',
    `/repos/${OWNER}/${REPO}/releases/${rel.json.id}/assets?name=${encodeURIComponent(EXE_NAME)}`,
    buf, 'application/octet-stream');
  console.log('asset:', up.status, up.json.browser_download_url || up.json.message);
})().catch(e => { console.error(e); process.exit(1); });
