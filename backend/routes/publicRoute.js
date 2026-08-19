import express from "express";
import { getPublicQueueSnapshot } from "../controllers/publicQueueController.js";
import { postContactMessage } from "../controllers/contactController.js";
import { telegramWebhook } from "../controllers/telegramController.js";
import { contactLimiter } from "../middlewares/security.js";

const router = express.Router();

router.get("/queue", getPublicQueueSnapshot);
router.post("/contact", contactLimiter, postContactMessage);
router.post("/telegram/webhook", telegramWebhook);

export default router;
