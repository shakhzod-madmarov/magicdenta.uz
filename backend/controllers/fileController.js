import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import treatmentModel from "../models/treatmentModel.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";

const ROOT = process.cwd();

const sendFileSafe = (res, absPath, mimeType) => {
  const normalizedRoot = path.resolve(ROOT);
  const normalizedFile = path.resolve(absPath);

  if (!normalizedFile.startsWith(normalizedRoot)) {
    return res.status(403).json({ success: false, message: "Forbidden path" });
  }

  if (!fs.existsSync(normalizedFile)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  if (mimeType) res.setHeader("Content-Type", mimeType);
  res.setHeader("Cache-Control", "private, max-age=86400");
  return res.sendFile(normalizedFile);
};

export const getXrayFile = async (req, res) => {
  try {
    const { treatmentId, xrayId } = req.params;

    const t = await treatmentModel.findById(treatmentId).lean();
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Treatment not found" });
    }

    const x = (t.xrays || []).find((a) => String(a._id) === String(xrayId));
    if (!x) {
      return res
        .status(404)
        .json({ success: false, message: "Xray not found" });
    }

    let isAdmin = req.admin === true;
    let dentistId = req.dentistId || null;
    let userId = req.userId || null;

    const token =
      String(req.query?.token || "").trim() ||
      String(req.query?.atoken || "").trim() ||
      String(req.query?.dtoken || "").trim() ||
      String(req.query?.utoken || "").trim();

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload?.role === "admin") isAdmin = true;
        if (payload?.dentistId) dentistId = payload.dentistId;
        if (payload?.userId) userId = payload.userId;
      } catch {}
    }

    const isDentist = Boolean(dentistId);
    const isUser = userId && String(userId) === String(t.userId);

    if (!isAdmin && !isDentist && !isUser) {
      return res.status(403).json({ success: false, message: "No access" });
    }

    const absPath = path.join(ROOT, x.path);

    const rawMime = String(x.mimeType || "").toLowerCase();
    let mime = rawMime || "image/jpeg";
    if (mime === "image/jfif") mime = "image/jpeg";

    return sendFileSafe(res, absPath, mime);
  } catch (e) {
    console.error("getXrayFile error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrthodontistQueueProgressFile = async (req, res) => {
  try {
    const { queueId, imageId } = req.params;

    const entry = await orthodontistQueueModel.findById(queueId).lean();
    if (!entry) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Orthodontist queue entry not found",
        });
    }

    const image = (entry.progressImages || []).find(
      (item) => String(item._id) === String(imageId),
    );

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Queue image not found" });
    }

    let isAdmin = req.admin === true;
    let dentistId = req.dentistId || null;
    let userId = req.userId || null;

    const token =
      String(req.query?.token || "").trim() ||
      String(req.query?.atoken || "").trim() ||
      String(req.query?.dtoken || "").trim() ||
      String(req.query?.utoken || "").trim();

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload?.role === "admin") isAdmin = true;
        if (payload?.dentistId) dentistId = payload.dentistId;
        if (payload?.userId) userId = payload.userId;
      } catch {}
    }

    const isDentist = Boolean(dentistId);
    const isUser =
      userId &&
      (String(userId) === String(entry.userId) ||
        String(userId) === String(entry.patientId));

    if (!isAdmin && !isDentist && !isUser) {
      return res.status(403).json({ success: false, message: "No access" });
    }

    const absPath = path.join(ROOT, image.path);
    const rawMime = String(image.mimeType || "").toLowerCase();
    let mime = rawMime || "image/jpeg";
    if (mime === "image/jfif") mime = "image/jpeg";

    return sendFileSafe(res, absPath, mime);
  } catch (error) {
    console.error("getOrthodontistQueueProgressFile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
