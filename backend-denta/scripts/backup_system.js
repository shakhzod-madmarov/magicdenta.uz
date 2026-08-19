import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration from backend folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "magicdenta_dev";

// Generate timestamp for the backup name
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
const backupFolderName = `magicdenta_backup_${timestamp}`;

// Define local paths
const projectRoot = path.resolve(__dirname, "../");
const backupParentDir = path.join(projectRoot, "backups");
const targetBackupDir = path.join(backupParentDir, backupFolderName);
const databaseDest = path.join(targetBackupDir, "database");
const uploadsSrc = path.join(projectRoot, "uploads");
const uploadsDest = path.join(targetBackupDir, "uploads");

async function runBackup() {
  console.log("=== MAGIC DENTA BACKUP TOOL ===");
  console.log(`Target directory: ${targetBackupDir}`);

  // 1. Ensure backup directory exists
  if (!fs.existsSync(backupParentDir)) {
    fs.mkdirSync(backupParentDir, { recursive: true });
  }
  fs.mkdirSync(targetBackupDir, { recursive: true });

  // 2. Dump Database
  console.log("Exporting database...");
  try {
    // If URI contains database name, use it, else append database flag
    const connectionUri = mongoUri.includes("/" + dbName) ? mongoUri : `${mongoUri.replace(/\/$/, "")}/${dbName}`;
    const cmd = `mongodump --uri="${connectionUri}" --out="${databaseDest}"`;
    execSync(cmd, { stdio: "inherit" });
    console.log("✓ Database backup completed successfully!");
  } catch (err) {
    console.error("✗ Failed to dump database. Ensure 'mongodump' is installed and added to your system PATH.");
    console.error(err.message);
  }

  // 3. Copy Uploaded Files (Images, X-rays, etc.)
  console.log("Copying uploaded media files...");
  try {
    if (fs.existsSync(uploadsSrc)) {
      fs.cpSync(uploadsSrc, uploadsDest, { recursive: true });
      console.log("✓ Media uploads copied successfully!");
    } else {
      console.log("⚠ No uploads directory found to back up.");
    }
  } catch (err) {
    console.error("✗ Failed to copy uploads directory.");
    console.error(err.message);
  }

  console.log("\n=================================");
  console.log(`✓ Backup complete! Folder saved to:\n${targetBackupDir}`);
  console.log("You can now safely copy-paste this folder onto your external SSD or Flash Card.");
  console.log("=================================");
}

runBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
