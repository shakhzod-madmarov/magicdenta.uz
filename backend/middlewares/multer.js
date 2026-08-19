import multer from "multer";
import {
  buildInvalidImageUploadError,
  isAcceptedImageUpload,
} from "../utils/imageUpload.js";

const memoryStorage = multer.memoryStorage();

const imageOnlyFilter = (_req, file, cb) => {
  if (!isAcceptedImageUpload(file)) {
    return cb(buildInvalidImageUploadError(), false);
  }

  cb(null, true);
};

export const uploadDentistAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadPatientAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadXrays = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
}).array("xrays", 10);
