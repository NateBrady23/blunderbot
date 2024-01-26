import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

export async function writeLog(
  filename: string,
  message: string,
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
    if (!existsSync(logPath)) {
      mkdirSync(logPath);
    }
    if (!existsSync(logFile)) {
      writeFileSync(logFile, '');
    }
    appendFileSync(logFile, `${message}\n`);
  } catch (e) {
    console.error(e);
    console.error('Error writing to log file:', filename, message);
  }
}
