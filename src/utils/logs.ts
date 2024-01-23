const fs = require('fs');
const path = require('path');
export async function writeLog(
  filename,
  message,
  opts?: { excludeDate?: boolean }
) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  try {
    if (!opts?.excludeDate) {
      // Get current date in format: YYYY-MM-DD
      const date = new Date().toISOString().split('T')[0];
      filename += `-${date}.log`;
    }
    console.log(`${filename}: ${message}`);
    const logPath = path.join(__dirname, '../../logs');
    const logFile = path.join(logPath, filename);
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath);
    }
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
    }
    fs.appendFileSync(logFile, `${message}\n`);
  } catch (e) {
    console.error(e);
    console.error('Error writing to log file:', filename, message);
  }
}
