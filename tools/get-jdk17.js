// Download and install Java 17 (Temurin) for the build
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.zip';
const dest = path.join(process.env.LOCALAPPDATA || 'C:/Users/guyut/AppData/Local', 'Temp/jdk17.zip');

console.log('Downloading Java 17...');
const file = fs.createWriteStream(dest);
https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('Download failed:', res.statusCode, res.statusMessage);
    process.exit(1);
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download complete. Extracting...');
      try {
        execSync(`powershell -Command "Expand-Archive -Path '${dest}' -DestinationPath 'C:/Program Files/Eclipse Adoptium/jdk-17'"`);
        console.log('Extracted to C:/Program Files/Eclipse Adoptium/jdk-17');
        fs.unlinkSync(dest);
        console.log('Done!');
      } catch(e) {
        console.error('Extract failed:', e.message);
        process.exit(1);
      }
    });
  });
}).on('error', (e) => {
  console.error('Download error:', e.message);
  process.exit(1);
});
