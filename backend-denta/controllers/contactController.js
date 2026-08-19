import { sendContactEmail, MailConfigError } from "../utils/mail.js";
import contactModel from "../models/contactModel.js";
import { sendTelegramMessage, isTelegramConfigured } from "../utils/telegramBot.js";

const isValidEmail = (value = "") => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
};

export const postContactMessage = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Ism, telefon va xabar majburiy.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Elektron pochta manzili noto‘g‘ri.",
      });
    }

    // 1. Persist the message in MongoDB database
    const contactDoc = await contactModel.create({
      name,
      phone,
      email,
      message,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    });

    let emailSent = false;
    let emailErrorMsg = "";

    // 2. Attempt sending email notification via SMTP
    try {
      await sendContactEmail({
        name,
        phone,
        email,
        message,
      });
      emailSent = true;
      contactDoc.emailSent = true;
    } catch (mailErr) {
      emailErrorMsg = mailErr?.message || "Email yuborishda xatolik";
      contactDoc.emailError = emailErrorMsg;
      console.warn("[contact-controller] SMTP Email dispatch notice:", {
        code: mailErr?.code,
        message: mailErr?.message,
      });
    }

    // 3. Attempt Telegram notification to Admin/Clinic if configured
    if (isTelegramConfigured() && process.env.TELEGRAM_ADMIN_CHAT_ID) {
      try {
        const tgText = `📩 <b>Yangi Murojaat (Sayt Kontakt Formasi)</b>\n\n` +
          `👤 <b>F.I.SH:</b> ${name}\n` +
          `📞 <b>Telefon:</b> ${phone}\n` +
          `✉️ <b>Email:</b> ${email || "Ko'rsatilmagan"}\n` +
          `💬 <b>Xabar:</b> ${message}\n\n` +
          `🕒 <i>${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</i>`;

        await sendTelegramMessage({
          chatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
          text: tgText,
        });
        contactDoc.telegramSent = true;
      } catch (tgErr) {
        console.warn("[contact-controller] Telegram alert notice:", tgErr?.message);
      }
    }

    await contactDoc.save();

    return res.status(200).json({
      success: true,
      message: "Xabaringiz muvaffaqiyatli qabul qilindi — mutaxassislarimiz tez orada siz bilan bog‘lanadi.",
    });
  } catch (error) {
    console.error("[contact-controller] Fatal contact request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server xatoligi yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring yoki to‘g‘ridan-to‘g‘ri telefon orqali bog‘laning.",
    });
  }
};
