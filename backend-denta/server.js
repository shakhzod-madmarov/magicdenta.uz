import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import multer from "multer";

import adminRouter from "./routes/adminRoute.js";
import dentistRouter from "./routes/dentistRoute.js";
import userRouter from "./routes/userRoute.js";
import fileRouter from "./routes/fileRoute.js";
import publicRouter from "./routes/publicRoute.js";

import { autoMissAllDentists } from "./utils/autoMiss.js";
import { expireWalkIns } from "./utils/walkInExpire.js";
import { runTelegramReminderJob } from "./utils/telegramReminderJob.js";
import { runTelegramPaymentNotificationJob } from "./utils/telegramPaymentNotificationJob.js";
import { runOrthodontistFollowUpReminderJob } from "./utils/telegramOrthodontistFollowUpJob.js";
import { applySecurityMiddlewares } from "./middlewares/security.js";
import { getPublicQueueSnapshot } from "./controllers/publicQueueController.js";

import userModel from "./models/userModel.js";
import { fixExaggeratedAmounts } from "./utils/fixExaggeratedAmounts.js";


const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.set("query parser", "simple");

const ROOT = process.cwd();

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.CLIENT_ORIGINS || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (!origin) return cb(null, true);

      if (process.env.NODE_ENV === "production" && !allowed.length) {
        return cb(null, false);
      }

      if (!allowed.length) return cb(null, true);

      return cb(null, allowed.includes(origin));
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "atoken",
      "dtoken",
      "token",
      "x-screen-key",
      "x-telegram-bot-api-secret-token",
    ],
  }),
);

applySecurityMiddlewares(app);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const PUBLIC_UPLOADS_DIR = path.join(ROOT, "uploads", "public");
app.use(
  "/uploads",
  express.static(PUBLIC_UPLOADS_DIR, {
    index: false,
    maxAge: "30d",
    etag: true,
    immutable: true,
    dotfiles: "deny",
  }),
);

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "magic-denta-backend" });
});

app.use("/api/public", publicRouter);
app.use("/api/files", fileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dentist", dentistRouter);
app.use("/api/user", userRouter);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.get("/api/public/queue", getPublicQueueSnapshot);

app.use((_req, res) => {
  return res.status(404).json({ success: false, message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "Uploaded file is too large" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err?.name === "ImageUploadError" || err?.status === 400) {
    return res
      .status(400)
      .json({ success: false, message: err.message || "Invalid image upload" });
  }

  if (err) {
    console.error("Unhandled error:", err);
    const safeMsg =
      process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error";
    return res.status(500).json({ success: false, message: safeMsg });
  }
  next();
});

const port = process.env.PORT || 4000;

const startBackgroundJobs = () => {
  const intervalMs = Math.max(
    30000,
    Number(process.env.BACKGROUND_JOB_INTERVAL_MS || 60000),
  );

  let jobRunning = false;

  setInterval(async () => {
    if (jobRunning) return;
    jobRunning = true;

    try {
      await autoMissAllDentists();
      await expireWalkIns();
      await runTelegramReminderJob();
    } catch (e) {
      console.error("background jobs failed:", e?.message || e);
    } finally {
      jobRunning = false;
    }
  }, intervalMs);
};

const startTelegramEventJob = () => {
  const intervalMs = Math.max(
    2000,
    Number(process.env.TELEGRAM_EVENT_JOB_INTERVAL_MS || 5000),
  );

  let jobRunning = false;

  setInterval(async () => {
    if (jobRunning) return;
    jobRunning = true;

    try {
      await runTelegramPaymentNotificationJob();
      await runOrthodontistFollowUpReminderJob();
    } catch (e) {
      console.error("telegram payment event job failed:", e?.message || e);
    } finally {
      jobRunning = false;
    }
  }, intervalMs);
};

const start = async () => {
  try {
    await connectDB();
    await ensureUserContactIndexes();
    await fixExaggeratedAmounts();

    app.listen(port, "127.0.0.1", () =>
      console.log("Server started on port", port),
    );

    startBackgroundJobs();
    startTelegramEventJob();

    if (process.env.TELEGRAM_BOT_TOKEN) {
      import("./utils/telegramBot.js")
        .then(({ registerTelegramWebhook }) => registerTelegramWebhook())
        .catch((err) => console.warn("[server] Telegram auto webhook warning:", err?.message));
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

const isSingleFieldIndex = (index, field) => {
  const keys = Object.keys(index?.key || {});
  return keys.length === 1 && keys[0] === field && index.key[field] === 1;
};

const ensureUserContactIndexes = async () => {
  const collection = userModel.collection;

  let indexes = [];
  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error?.codeName !== "NamespaceNotFound") throw error;
  }

  for (const index of indexes) {
    if (index.name === "_id_") continue;

    const isPhoneIndex = isSingleFieldIndex(index, "phone");
    const isEmailIndex = isSingleFieldIndex(index, "email");

    if ((isPhoneIndex || isEmailIndex) && index.unique) {
      await collection.dropIndex(index.name);
    }
  }

  let refreshed = [];
  try {
    refreshed = await collection.indexes();
  } catch (error) {
    if (error?.codeName !== "NamespaceNotFound") throw error;
  }

  const hasPhoneIndex = refreshed.some((index) =>
    isSingleFieldIndex(index, "phone"),
  );
  const hasEmailIndex = refreshed.some((index) =>
    isSingleFieldIndex(index, "email"),
  );

  if (!hasPhoneIndex) {
    await collection.createIndex(
      { phone: 1 },
      { name: "user_phone_idx", background: true },
    );
  }

  if (!hasEmailIndex) {
    await collection.createIndex(
      { email: 1 },
      { name: "user_email_idx", background: true, sparse: true },
    );
  }
};

start();
