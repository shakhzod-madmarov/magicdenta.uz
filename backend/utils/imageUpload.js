import path from "path";

export const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".heic",
  ".heif",
]);

export const ACCEPTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/pjpeg",
  "image/jpg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/x-windows-bmp",
  "image/tif",
  "image/tiff",
  "image/x-tiff",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

export const WEAK_IMAGE_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
  "application/force-download",
  "application/download",
]);

export const getImageFileExtension = (fileOrName = "") => {
  const originalName =
    typeof fileOrName === "string"
      ? fileOrName
      : String(fileOrName?.originalname || "");

  return path.extname(originalName).toLowerCase();
};

export const hasAcceptedImageExtension = (fileOrName = "") =>
  ACCEPTED_IMAGE_EXTENSIONS.has(getImageFileExtension(fileOrName));

export const isAcceptedImageMimeType = (mime = "") => {
  const normalizedMime = String(mime || "").trim().toLowerCase();

  if (!normalizedMime) return false;
  return ACCEPTED_IMAGE_MIME_TYPES.has(normalizedMime);
};

export const isAcceptedImageUpload = (file) => {
  const mime = String(file?.mimetype || "").trim().toLowerCase();
  const hasKnownExtension = hasAcceptedImageExtension(file);

  if (ACCEPTED_IMAGE_MIME_TYPES.has(mime)) return true;

  if (mime.startsWith("image/")) {
    return hasKnownExtension;
  }

  if (WEAK_IMAGE_MIME_TYPES.has(mime)) {
    return hasKnownExtension;
  }

  return false;
};

export const buildInvalidImageUploadError = () => {
  const error = new Error(
    "Only real image files are allowed (jpg, jpeg, jfif, png, webp, gif, bmp, tif, tiff, avif, heic, heif)",
  );

  error.name = "ImageUploadError";
  error.status = 400;
  return error;
};
