import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import compression from "compression";

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }

    if (
      obj[key] &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      sanitizeObject(obj[key]);
    }
  }

  return obj;
};

const mongoSanitizeMiddleware = (req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
};

export const applySecurityMiddlewares = (app) => {
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(hpp());
  app.use(mongoSanitizeMiddleware);

  app.use(
    compression({
      level: 6,
      threshold: 1024,
    })
  );

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.NODE_ENV === "production" ? 300 : 10000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => {
      if (process.env.NODE_ENV !== "production") return true;
      return req.path === "/api/health";
    },
    message: {
      success: false,
      message: "Juda ko'p so'rovlar. Keyinroq qayta urinib ko'ring.",
    },
  });

  app.use("/api", apiLimiter);
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p kirish urinishlari. Keyinroq qayta urinib ko'ring.",
  },
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Xabarlar chegarasi oshdi. Iltimos, 15 daqiqadan so'ng urinib ko'ring.",
  },
});
