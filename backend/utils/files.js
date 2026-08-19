import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const UPLOADS_DIR = path.join(ROOT, "uploads");
const PUBLIC_DIR = path.join(UPLOADS_DIR, "public");

export const ensureDir = (dir) => {
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const moveFile = (fromPath, toPath) => {
  if (!fromPath || !toPath) return;
  ensureDir(path.dirname(toPath));
  fs.renameSync(fromPath, toPath);
};

export const safeRelPath = (absPath) => {
  if (!absPath) return "";
  const rel = path.relative(ROOT, absPath);
  return rel.replace(/\\/g, "/");
};

export const slugify = (str = "") =>
  String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toLowerCase() || "file";

export const safeFilenamePart = (value = "", fallback = "file") => {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .trim();

  const slug = cleaned
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug || fallback;
};

export const formatDateTimeForFilename = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
};



export const buildDentistImageFileName = ({
  dentistId,
  dentistName,
  ext = ".jpg",
  date = new Date(),
}) => {
  const safeDentistId = safeFilenamePart(dentistId, "dentist");
  const safeDentistName = safeFilenamePart(dentistName, "dentist");
  const timestamp = formatDateTimeForFilename(date);
  return `dentist_${safeDentistId}_${safeDentistName}_${timestamp}${ext}`;
};

export const buildPatientImageFileName = ({
  patientId,
  patientName,
  ext = ".jpg",
  date = new Date(),
}) => {
  const safePatientId = safeFilenamePart(patientId, "patient");
  const safePatientName = safeFilenamePart(patientName, "patient");
  const timestamp = formatDateTimeForFilename(date);

  return `patient_${safePatientId}_${safePatientName}_${timestamp}${ext}`;
};

export const buildPatientXrayFileName = ({
  patientId,
  patientName,
  index = null,
  ext = ".jpg",
  date = new Date(),
}) => {
  const safePatientId = safeFilenamePart(patientId, "patient");
  const safePatientName = safeFilenamePart(patientName, "patient");
  const timestamp = formatDateTimeForFilename(date);

  return index && Number(index) > 0
    ? `xray_patient_${safePatientId}_${safePatientName}_${timestamp}_${index}${ext}`
    : `xray_patient_${safePatientId}_${safePatientName}_${timestamp}${ext}`;
};

export const deletePublicFileByUrl = (urlPath) => {
  try {
    if (!urlPath) return;

    const m = String(urlPath).match(/^\/?uploads\/(.+)$/);
    if (!m) return;

    const rel = m[1];
    const abs = path.join(PUBLIC_DIR, rel);

    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
    }
  } catch (e) {
    console.error("deletePublicFileByUrl error:", e.message);
  }
};
