const ACCEPTED_IMAGE_EXTENSIONS = new Set([
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

const ACCEPTED_IMAGE_MIME_TYPES = new Set([
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

const HEIF_IMAGE_EXTENSIONS = new Set([".heic", ".heif"]);
const HEIF_IMAGE_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const WEAK_IMAGE_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
  "application/force-download",
  "application/download",
]);

const BROWSER_PREVIEWABLE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
]);

const BROWSER_PREVIEWABLE_MIME_TYPES = new Set([
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
  "image/avif",
]);

let heic2anyLoader = null;

export const IMAGE_INPUT_ACCEPT_ATTR =
  "image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.bmp,.tif,.tiff,.avif,.heic,.heif";

export const getImageFileExtension = (fileOrName = "") => {
  const originalName =
    typeof fileOrName === "string"
      ? fileOrName
      : String(fileOrName?.name || "");

  const dotIndex = originalName.lastIndexOf(".");
  return dotIndex >= 0 ? originalName.slice(dotIndex).toLowerCase() : "";
};

export const isAcceptedImageFile = (file) => {
  if (!file) return false;

  const mime = String(file.type || "").trim().toLowerCase();
  const ext = getImageFileExtension(file);
  const hasKnownExt = ACCEPTED_IMAGE_EXTENSIONS.has(ext);

  if (ACCEPTED_IMAGE_MIME_TYPES.has(mime)) return true;
  if (mime.startsWith("image/")) return hasKnownExt;
  if (WEAK_IMAGE_MIME_TYPES.has(mime)) return hasKnownExt;

  return false;
};

export const isHeifLikeImageFile = (file) => {
  if (!file) return false;

  const mime = String(file.type || "").trim().toLowerCase();
  const ext = getImageFileExtension(file);

  return HEIF_IMAGE_EXTENSIONS.has(ext) || HEIF_IMAGE_MIME_TYPES.has(mime);
};

export const canPreviewImageFile = (file) => {
  if (!file) return false;

  const mime = String(file.type || "").trim().toLowerCase();
  const ext = getImageFileExtension(file);

  if (BROWSER_PREVIEWABLE_MIME_TYPES.has(mime)) return true;
  return BROWSER_PREVIEWABLE_EXTENSIONS.has(ext);
};

export const getImageFileError = (file, { maxBytes = null } = {}) => {
  if (!file) return "Rasm faylini tanlang.";
  if (!isAcceptedImageFile(file)) {
    return "Faqat rasm fayllari qabul qilinadi: JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, HEIC yoki HEIF.";
  }
  if (maxBytes && Number(file.size || 0) > maxBytes) {
    return `Rasm hajmi ${Math.round(maxBytes / (1024 * 1024))}MB dan oshmasligi kerak.`;
  }
  return "";
};

export const getImagePreviewFallbackNote = () => "";

const loadHeic2Any = async () => {
  if (!heic2anyLoader) {
    heic2anyLoader = import("heic2any").then((mod) => mod.default || mod);
  }

  return heic2anyLoader;
};

export const createImagePreviewUrl = async (file) => {
  if (!file) return "";

  if (canPreviewImageFile(file)) {
    return URL.createObjectURL(file);
  }

  if (isHeifLikeImageFile(file)) {
    try {
      const heic2any = await loadHeic2Any();
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const previewBlob = Array.isArray(converted) ? converted[0] : converted;

      if (previewBlob instanceof Blob) {
        return URL.createObjectURL(previewBlob);
      }
    } catch (error) {
      console.error("HEIC/HEIF preview tayyorlanmadi:", error);
    }
  }

  return "";
};

export const createImagePreviewItems = async (files = []) => {
  const previews = await Promise.all(
    (files || []).map(async (file, index) => ({
      id: `${file?.name || "rasm"}-${file?.size || 0}-${index}`,
      name: file?.name || `Rasm ${index + 1}`,
      url: await createImagePreviewUrl(file),
    })),
  );

  return previews;
};

export const revokePreviewUrl = (url) => {
  if (typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export const revokePreviewItems = (items = []) => {
  (items || []).forEach((item) => revokePreviewUrl(item?.url));
};

export const humanizeImageUploadMessage = (
  message,
  fallback = "Rasm bilan ishlashda xatolik yuz berdi.",
) => {
  const raw = String(message || "").trim();
  const lower = raw.toLowerCase();

  if (!raw) return fallback;

  if (
    lower.includes("fallback konvertori") ||
    (lower.includes("heic-convert") && lower.includes("npm install"))
  ) {
    return "Serverdagi HEIC/HEIF konvertori hali o‘rnatilmagan. Backendda npm install ishga tushirib, serverni qayta yoqing.";
  }

  if (
    lower.includes("heic/heif") &&
    (lower.includes("ocholmadi") || lower.includes("aylantirib bo‘lmadi"))
  ) {
    return "HEIC yoki HEIF rasmni server qayta ishlay olmadi. Backend yangilangandan keyin yana urinib ko‘ring.";
  }

  if (
    lower.includes("unsupported") ||
    lower.includes("input file") ||
    lower.includes("qo‘llab-quvvatlanmadi")
  ) {
    return "Yuklangan fayl rasm sifatida ochilmadi. Iltimos, boshqa rasm tanlang.";
  }

  if (lower.includes("xavfsiz jpg")) {
    return "Rasmni saqlash uchun tayyorlab bo‘lmadi. Iltimos, boshqa rasm tanlang.";
  }

  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Server bilan aloqa uzildi. Internetni tekshirib, qayta urinib ko‘ring.";
  }

  if (lower.includes("server error") || lower.includes("server xatosi")) {
    return "Serverda vaqtinchalik xatolik yuz berdi. Birozdan keyin qayta urinib ko‘ring.";
  }

  return raw;
};
