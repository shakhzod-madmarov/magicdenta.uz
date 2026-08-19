// const TELEGRAM_API_BASE = "https://api.telegram.org";

// const getBotToken = () => String(process.env.TELEGRAM_BOT_TOKEN || "").trim();

// export const isTelegramConfigured = () => {
//   return Boolean(getBotToken());
// };

// export const sendTelegramMessage = async ({
//   chatId,
//   text,
//   replyMarkup = null,
// }) => {
//   const token = getBotToken();
//   if (!token) {
//     throw new Error("TELEGRAM_BOT_TOKEN topilmadi");
//   }

//   const body = {
//     chat_id: chatId,
//     text,
//     parse_mode: "HTML",
//     disable_web_page_preview: true,
//   };

//   if (replyMarkup) {
//     body.reply_markup = replyMarkup;
//   }

//   const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   });

//   const data = await res.json().catch(() => null);

//   if (!res.ok || !data?.ok) {
//     throw new Error(data?.description || "Telegram message yuborilmadi");
//   }

//   return data.result;
// };

// export const sendTelegramWebhookReply = async ({
//   chatId,
//   text,
//   replyMarkup = null,
// }) => {
//   try {
//     await sendTelegramMessage({ chatId, text, replyMarkup });
//   } catch (error) {
//     console.error("sendTelegramWebhookReply error:", error?.message || error);
//   }
// };

const TELEGRAM_API_BASE = "https://api.telegram.org";

const getBotToken = () => String(process.env.TELEGRAM_BOT_TOKEN || "").trim();

export const isTelegramConfigured = () => {
  return Boolean(getBotToken());
};

let cachedBotUsername = "";

export const getTelegramBotUsername = async () => {
  if (cachedBotUsername) return cachedBotUsername;
  let envUsername = String(process.env.TELEGRAM_BOT_USERNAME || "").trim().replace(/^@/, "");
  if (envUsername && envUsername.toLowerCase().endsWith("bot")) {
    cachedBotUsername = envUsername;
    return envUsername;
  }
  const token = getBotToken();
  if (!token) return envUsername || "";
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getMe`);
    const data = await res.json().catch(() => null);
    if (data?.ok && data.result?.username) {
      cachedBotUsername = data.result.username;
      process.env.TELEGRAM_BOT_USERNAME = data.result.username;
      return data.result.username;
    }
  } catch (err) {
    console.warn("[telegram-bot] Failed to fetch bot username via getMe:", err.message);
  }
  return envUsername || "";
};

export const registerTelegramWebhook = async (customToken = null) => {
  const token = customToken || getBotToken();
  if (!token) return { success: false, message: "Telegram bot token topilmadi" };

  const baseUrl = process.env.FRONTEND_BASE_URL || "https://magicdenta.uz";
  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/public/telegram/webhook`;

  try {
    const res = await fetch(
      `${TELEGRAM_API_BASE}/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`
    );
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      console.log(`[telegram-bot] Webhook successfully registered: ${webhookUrl}`);
      return { success: true, webhookUrl };
    } else {
      console.warn(`[telegram-bot] Failed to register webhook:`, data?.description);
      return { success: false, message: data?.description || "Webhook o'rnatilmadi" };
    }
  } catch (err) {
    console.error(`[telegram-bot] Error setting webhook:`, err.message);
    return { success: false, message: err.message };
  }
};

export const sendTelegramMessage = async ({
  chatId,
  text,
  replyMarkup = null,
}) => {
  const token = getBotToken();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN topilmadi");
  }

  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new Error(data?.description || "Telegram message yuborilmadi");
  }

  return data.result;
};

export const sendTelegramWebhookReply = async ({
  chatId,
  text,
  replyMarkup = null,
}) => {
  try {
    await sendTelegramMessage({ chatId, text, replyMarkup });
  } catch (error) {
    console.error("sendTelegramWebhookReply error:", error?.message || error);
  }
};

export const notifyDentistAboutPatientArrival = async ({
  dentistId,
  patientName,
  queueNo,
  isWalkIn,
  appointmentType,
  slotTime,
  note,
}) => {
  try {
    if (!dentistId) return;
    const { default: dentistModel } = await import("../models/dentistModel.js");
    const dentist = await dentistModel.findById(dentistId).select("telegram").lean();
    if (!dentist || !dentist.telegram?.isVerified || !dentist.telegram?.chatId) {
      return;
    }
    const { buildDentistArrivedNotificationMessage } = await import("./telegramMessageBuilders.js");
    const text = buildDentistArrivedNotificationMessage({
      patientName,
      queueNo,
      isWalkIn,
      appointmentType,
      slotTime,
      note,
      language: process.env.TELEGRAM_LANGUAGE || "uz",
    });
    await sendTelegramMessage({
      chatId: dentist.telegram.chatId,
      text,
    });
  } catch (error) {
    console.error("[notifyDentistAboutPatientArrival] Failed:", error.message);
  }
};

export const notifyDentistAboutPayment = async ({
  dentistId,
  patientName,
  amount,
  debt,
  note,
}) => {
  try {
    if (!dentistId) return;
    const { default: dentistModel } = await import("../models/dentistModel.js");
    const dentist = await dentistModel.findById(dentistId).select("telegram").lean();
    if (!dentist || !dentist.telegram?.isVerified || !dentist.telegram?.chatId) {
      return;
    }
    const { buildDentistPaymentReceivedMessage } = await import("./telegramMessageBuilders.js");
    const text = buildDentistPaymentReceivedMessage({
      patientName,
      amount,
      debt,
      note,
      language: process.env.TELEGRAM_LANGUAGE || "uz",
    });
    await sendTelegramMessage({
      chatId: dentist.telegram.chatId,
      text,
    });
  } catch (error) {
    console.error("[notifyDentistAboutPayment] Failed:", error.message);
  }
};

/**
 * Notify a dentist about a newly scheduled (future) appointment.
 * Used for:
 *   - Online bookings from the patient website (createdFrom: "USER")
 *   - Admin "Rejaliq qo'shish" (createdFrom: "ADMIN")
 *   - Dentist "Rejaliq qo'shish" (createdFrom: "DENTIST")
 *
 * This fires immediately regardless of whether the appointment is today or future.
 * The message shows: patient name, date, time, who booked it.
 */
export const notifyDentistAboutNewBooking = async ({
  dentistId,
  patientName,
  slotDate,
  slotTime,
  slotDateFormatted,
  note,
  createdFrom,
}) => {
  try {
    if (!dentistId) return;
    const { default: dentistModel } = await import("../models/dentistModel.js");
    const dentist = await dentistModel.findById(dentistId).select("telegram").lean();
    if (!dentist || !dentist.telegram?.isVerified || !dentist.telegram?.chatId) {
      return;
    }
    const { buildDentistNewBookingMessage } = await import("./telegramMessageBuilders.js");
    const text = buildDentistNewBookingMessage({
      patientName,
      slotDate,
      slotTime,
      slotDateFormatted,
      note: note || "",
      createdFrom: createdFrom || "USER",
      language: process.env.TELEGRAM_LANGUAGE || "uz",
    });
    await sendTelegramMessage({
      chatId: dentist.telegram.chatId,
      text,
    });
  } catch (error) {
    console.error("[notifyDentistAboutNewBooking] Failed:", error.message);
  }
};

export const notifyDentistAboutReschedule = async ({
  dentistId,
  patientName,
  oldSlotDate,
  oldSlotTime,
  newSlotDate,
  newSlotTime,
  rescheduledByName,
  rescheduledByRole,
  reason,
}) => {
  try {
    if (!dentistId) return;
    const { default: dentistModel } = await import("../models/dentistModel.js");
    const dentist = await dentistModel.findById(dentistId).select("telegram").lean();
    if (!dentist || !dentist.telegram?.isVerified || !dentist.telegram?.chatId) {
      return;
    }
    const { buildDentistAppointmentRescheduledMessage } = await import("./telegramMessageBuilders.js");
    const text = buildDentistAppointmentRescheduledMessage({
      patientName,
      oldSlotDate,
      oldSlotTime,
      newSlotDate,
      newSlotTime,
      rescheduledByName,
      rescheduledByRole,
      reason: reason || "",
      language: process.env.TELEGRAM_LANGUAGE || "uz",
    });
    await sendTelegramMessage({
      chatId: dentist.telegram.chatId,
      text,
    });
  } catch (error) {
    console.error("[notifyDentistAboutReschedule] Failed:", error.message);
  }
};