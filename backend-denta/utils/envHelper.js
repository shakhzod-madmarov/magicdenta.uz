import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateEnvFile = (updates = {}) => {
  try {
    const envPath = process.env.ENV_FILE_PATH || path.resolve(__dirname, "..", ".env");
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf8");
    }

    const lines = content.split("\n");

    for (const [key, value] of Object.entries(updates)) {
      // Update process.env in memory immediately
      process.env[key] = String(value);

      let found = false;
      for (let i = 0; i < lines.length; i++) {
        const lineTrimmed = lines[i].trim();
        if (lineTrimmed.startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          found = true;
          break;
        }
      }
      if (!found) {
        lines.push(`${key}=${value}`);
      }
    }

    fs.writeFileSync(envPath, lines.join("\n"), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to .env:", error);
    return false;
  }
};

export const isRequestLocalAddress = (req) => {
  if (!req) return false;
  
  const checkValue = (val = '') => {
    const s = String(val || '').trim().toLowerCase();
    if (!s) return false;
    
    if (s === 'localhost' || s === '127.0.0.1' || s === '::1' || s.includes('::ffff:127.0.0.1')) return true;
    
    const cleanIp = s.replace(/^::ffff:/i, '');
    
    if (cleanIp.startsWith('192.168.')) return true;
    if (cleanIp.startsWith('10.')) return true;
    if (cleanIp.startsWith('172.')) {
      const parts = cleanIp.split('.');
      if (parts.length >= 2) {
        const second = Number(parts[1]);
        if (second >= 16 && second <= 31) return true;
      }
    }
    if (cleanIp.startsWith('fe80:')) return true;
    
    return false;
  };

  return checkValue(req.ip) || checkValue(req.hostname) || checkValue(req.headers?.host?.split(':')[0]);
};

export const isLoopbackRequest = (req) => {
  if (!req) return false;
  const checkValue = (val = '') => {
    const s = String(val || '').trim().toLowerCase();
    if (!s) return false;
    return s === 'localhost' || s === '127.0.0.1' || s === '::1' || s.includes('127.0.0.1') || s.includes('::1');
  };
  return checkValue(req.ip) || checkValue(req.hostname) || checkValue(req.headers?.host?.split(':')[0]);
};
