const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = path.resolve('AUDIT_REPORT.html');
const pdfPath = path.resolve('AUDIT_REPORT.pdf');
const tempProfile = path.resolve('temp_browser_profile');

if (!fs.existsSync(tempProfile)) {
  fs.mkdirSync(tempProfile, { recursive: true });
}

const browser = fs.existsSync(chromePath) ? chromePath : edgePath;
console.log('Using browser:', browser);

const cmd = `"${browser}" --headless --disable-gpu --user-data-dir="${tempProfile}" --virtual-time-budget=5000 --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

console.log('Executing:', cmd);
try {
  const out = execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
  console.log('Command finished.');
} catch (err) {
  console.error('Exec error:', err.message);
}

if (fs.existsSync(pdfPath)) {
  const stat = fs.statSync(pdfPath);
  console.log('SUCCESS! PDF generated:', pdfPath, 'Size:', stat.size, 'bytes');
} else {
  console.log('PDF not found after execution.');
}

