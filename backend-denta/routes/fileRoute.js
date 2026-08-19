import express from "express";
import jwt from "jsonwebtoken";
import {
  getOrthodontistQueueProgressFile,
  getXrayFile,
} from "../controllers/fileController.js";

const router = express.Router();

const anyAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token =
    bearer ||
    req.headers.atoken ||
    req.headers.dtoken ||
    req.headers.token ||
    null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.role === "admin") {
      req.admin = true;
      req.adminId = decoded.id || decoded.adminId || null;
    }

    if (decoded?.dentistId) {
      req.dentistId = decoded.dentistId;
    }

    if (decoded?.userId) {
      req.userId = decoded.userId;
    }
  } catch {}

  return next();
};

router.get("/xray/:treatmentId/:xrayId", anyAuth, getXrayFile);
router.get(
  "/orthodontist-queue-image/:queueId/:imageId",
  anyAuth,
  getOrthodontistQueueProgressFile,
);

export default router;
