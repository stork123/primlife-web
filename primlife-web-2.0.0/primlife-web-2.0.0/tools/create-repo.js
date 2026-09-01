// create GitHub repo using stored git credential
const { execSync } = require('child_process');
const https = require('https');
const cred = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = cred.match(/^password=(.+)$/m)[1].trim();
const body = JSON.stringify({
  name: 'primlife-web',
  description: 'Primordial Life - the 1995 artificial-life screensaver by Jason Spofford, ported to JavaScript/Electron for modern Windows',
  private: false
});
const req = https.request({
  hostname: 'api.github.com', path: '/user/repos', method: 'POST',
  headers: {
    'Authorization': 'token ' + token,
    'User-Agent': 'primlife-publish',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const j = JSON.parse(data);
    console.log(res.statusCode, j.full_name || j.message, j.html_url || '');
    if (j.errors) console.log(JSON.stringify(j.errors));
  });
});
req.end(body);
