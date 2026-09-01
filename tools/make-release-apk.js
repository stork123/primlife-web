// create GitHub release and upload the APK
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const VERSION = pkg.version;
const TAG = 'v' + VERSION;
const APK_NAME = 'Primordial.Life.' + VERSION + '.apk';
const APK_PATH = path.join(__dirname, '..', APK_NAME);

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
  let rel = await api('GET', 'api.github.com', '/repos/' + OWNER + '/' + REPO + '/releases/tags/' + TAG);

  if (rel.status === 404) {
    const releaseBody = 'Android-specific release \u2014 Capacitor-based APK with the simulation engine bundled.\n\n' +
      '**Changes**: Biot editor removed (not needed on mobile).\n\n' +
      '**Controls**: Tap biot to inspect | DPAD buttons for biot placement | On-screen pause/restart/sound/guide buttons.\n\n' +
      'Download `' + APK_NAME + '`, transfer to your phone, open and install.\n\nNo installation or registration required \u2014 just open and launch.';

    const body = JSON.stringify({
      tag_name: TAG,
      name: 'Primordial Life ' + VERSION + ' (Android)',
      body: releaseBody,
      draft: false,
      prerelease: false
    });
    rel = await api('POST', 'api.github.com', '/repos/' + OWNER + '/' + REPO + '/releases', body);
    console.log('release:', rel.status, rel.json.html_url || rel.json.message);
    if (rel.status !== 201) return;
  } else if (rel.status === 200) {
    console.log('release already exists:', rel.json.html_url);
  } else {
    console.log('unexpected status:', rel.status, rel.json ? rel.json.message : '(none)');
    return;
  }

  if (!fs.existsSync(APK_PATH)) {
    console.error('ERROR: ' + APK_PATH + ' not found.');
    process.exit(1);
  }
  const buf = fs.readFileSync(APK_PATH);
  console.log('uploading apk,', (buf.length / 1048576).toFixed(1), 'MB...');

  // Delete existing asset if present
  const existing = await api('GET', 'api.github.com', '/repos/' + OWNER + '/' + REPO + '/releases/tags/' + TAG);
  if (existing.status === 200) {
    for (const a of existing.json.assets || []) {
      if (a.name === APK_NAME) {
        await api('DELETE', 'api.github.com', '/repos/' + OWNER + '/' + REPO + '/releases/assets/' + a.id);
        console.log('deleted existing asset:', a.id);
      }
    }
  }

  const up = await api('POST', 'uploads.github.com',
    '/repos/' + OWNER + '/' + REPO + '/releases/' + rel.json.id + '/assets?name=' + encodeURIComponent(APK_NAME),
    buf, 'application/octet-stream');
  console.log('asset:', up.status, up.json.browser_download_url || up.json.message);
})().catch(e => { console.error(e); process.exit(1); });
