import fs from "fs";
import path from "path";
import sharp from "sharp";
import { ensureDir } from "./files.js";
import { getImageFileExtension } from "./imageUpload.js";

let heicConvertLoader;

const buildImageProcessingError = (message) => {
  const error = new Error(message);
  error.name = "ImageUploadError";
  error.status = 400;
  return error;
};

const getCompactErrorMessage = (err) =>
  String(err?.message || err || "")
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join(" | ");

const isHeifExtension = (originalName = "") =>
  [".heic", ".heif"].includes(getImageFileExtension(originalName));

const isHeifProcessingError = ({ originalName = "", err }) => {
  if (isHeifExtension(originalName)) {
    return true;
  }

  const rawMessage = String(err?.message || "").toLowerCase();
  return (
    rawMessage.includes("heic") ||
    rawMessage.includes("heif") ||
    rawMessage.includes("libheif") ||
    rawMessage.includes("compression format has not been built in") ||
    rawMessage.includes("unsupported codec")
  );
};

const getImageProcessingMessage = ({ originalName = "", err }) => {
  const rawMessage = String(err?.message || "").toLowerCase();

  if (isHeifExtension(originalName) || rawMessage.includes("heic") || rawMessage.includes("heif")) {
    if (rawMessage.includes("cannot find package") && rawMessage.includes("heic-convert")) {
      return "HEIC/HEIF fallback konvertori o‘rnatilmagan. Serverda npm install ishlatib yangilang.";
    }

    return "HEIC/HEIF rasmni serverda JPG ga aylantirib bo‘lmadi.";
  }

  if (rawMessage.includes("unsupported") || rawMessage.includes("input file")) {
    return "Yuklangan fayl rasm sifatida ochilmadi yoki server tomonidan qo‘llab-quvvatlanmadi.";
  }

  return "Yuklangan rasmni xavfsiz JPG formatiga aylantirib bo‘lmadi.";
};

const loadHeicConvert = async () => {
  if (!heicConvertLoader) {
    heicConvertLoader = import("heic-convert").then((mod) => mod.default || mod);
  }

  return heicConvertLoader;
};

const readInputAsBuffer = async (input) => {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (typeof input === "string") {
    return fs.promises.readFile(input);
  }

  throw buildImageProcessingError("Image input missing");
};

const encodeWithSharp = async (input, quality = 85) => {
  const buffer = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    mimeType: "image/jpeg",
    sizeBytes: buffer.length,
  };
};

const convertHeifToJpegBuffer = async (input, quality = 85) => {
  const heicConvert = await loadHeicConvert();
  const sourceBuffer = await readInputAsBuffer(input);
  const convertedBuffer = await heicConvert({
    buffer: sourceBuffer,
    format: "JPEG",
    quality: Math.max(0, Math.min(1, quality / 100)),
  });

  return Buffer.isBuffer(convertedBuffer)
    ? convertedBuffer
    : Buffer.from(convertedBuffer);
};

export const prepareImageForJpegStorage = async (
  input,
  { quality = 85, originalName = "" } = {},
) => {
  try {
    if (!input) {
      throw buildImageProcessingError("Image input missing");
    }

    return await encodeWithSharp(input, quality);
  } catch (err) {
    if (isHeifProcessingError({ originalName, err })) {
      try {
        const jpegBuffer = await convertHeifToJpegBuffer(input, quality);
        return await encodeWithSharp(jpegBuffer, quality);
      } catch (fallbackErr) {
        console.error(
          "prepareImageForJpegStorage error:",
          getCompactErrorMessage(fallbackErr),
        );
        throw buildImageProcessingError(
          getImageProcessingMessage({ originalName, err: fallbackErr }),
        );
      }
    }

    console.error(
      "prepareImageForJpegStorage error:",
      getCompactErrorMessage(err),
    );
    throw buildImageProcessingError(
      getImageProcessingMessage({ originalName, err }),
    );
  }
};

export const writePreparedImageToFile = async (preparedImage, outputPath) => {
  if (!preparedImage?.buffer) {
    throw buildImageProcessingError("Image buffer missing");
  }

  ensureDir(path.dirname(outputPath));

  try {
    await fs.promises.writeFile(outputPath, preparedImage.buffer);
    return preparedImage;
  } catch (err) {
    try {
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch {}

    console.error("writePreparedImageToFile error:", getCompactErrorMessage(err));
    throw err;
  }
};

export const sanitizeAndReencodeImage = async (input, outputPath, options = {}) => {
  const preparedImage = await prepareImageForJpegStorage(input, options);

  if (!outputPath) {
    return preparedImage;
  }

  await writePreparedImageToFile(preparedImage, outputPath);
  return preparedImage;
};
