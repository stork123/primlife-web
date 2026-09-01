// create/update GitHub release v1.2.0 and upload the portable exe
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

const TAG = 'v1.2.0';
const NAME = 'Primordial Life 1.2.0.exe';
const FILE = path.join(process.cwd(), 'release', NAME);
const SIZE = fs.statSync(FILE).size;

// get stored github token via git credential fill
const cred = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = cred.split('\n').find(l => l.startsWith('password='))?.split('=')[1]?.trim();
if (!token) { console.error('no token'); process.exit(1); }

const api = (method, endpoint, data) => {
  const body = data ? JSON.stringify(data) : null;
  const opts = {
    method, hostname: 'api.github.com', path: `/repos/stork123/primlife-web${endpoint}`,
    headers: { 'Authorization': `token ${token}`, 'User-Agent': 'primlife-build',
               'Accept': 'application/vnd.github+json', ...(body ? {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}:{}),
               'Content-Length': body ? Buffer.byteLength(body) : 0 }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const txt = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: txt ? JSON.parse(txt) : {} }); }
        catch { resolve({ status: res.statusCode, body: txt }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

(async () => {
  try {
    // upsert release
    let rel = await api('POST', '/releases', { tag_name: TAG, name: `Primordial Life ${TAG.slice(1)}`,
      body: 'Portable Windows build with biot editor, sound effects, and custom biot save/load.', draft: false, prerelease: false });
    if (rel.body.message === 'Validation Failed') {
      // already exists, fetch it
      const existing = await api('GET', `/releases/tags/${TAG}`);
      rel = existing;
    }
    if (!rel.body.upload_url) throw new Error('no upload_url: ' + JSON.stringify(rel.body));

    // upload asset
    const url = rel.body.upload_url.split('{')[0];
    console.log('uploading', NAME, SIZE, 'bytes...');
    const uploadReq = https.request(url, {
      method: 'POST', headers: {
        'Authorization': `token ${token}`, 'User-Agent': 'primlife-build',
        'Content-Type': 'application/octet-stream',
        'Content-Length': SIZE,
        'Accept': 'application/vnd.github+json'
      }
    }, res => {
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const txt = Buffer.concat(chunks).toString(); console.log(res.statusCode, txt); });
    });
    const stream = fs.createReadStream(FILE);
    stream.pipe(uploadReq);
  } catch (err) { console.error(err.message); process.exit(1); }
})();
