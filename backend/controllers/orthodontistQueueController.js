import userModel from "../models/userModel.js";
import dentistModel from "../models/dentistModel.js";
import { sendTelegramWebhookReply } from "../utils/telegramBot.js";
import {
  buildOrthodontistCalledMessage,
  buildOrthodontistMissedMessage,
  buildTelegramMainReplyKeyboard,
} from "../utils/telegramMessageBuilders.js";
import { formatUzDayKey } from "../../shared/date.js";
import {
  getOrthodontistQueueSnapshot,
  resolveOrthodontistDentist,
  updateOrthodontistQueueStatus,
  convertOrthodontistQueueToVisit,
  completeOrthodontistQueueEntry,
} from "../utils/orthodontistQueueService.js";

const resolveRequesterDentist = async (dentistId) => {
  if (!dentistId) return null;
  const currentDentist = await dentistModel.findById(dentistId).lean();
  if (!currentDentist) return null;

  const isOrtho =
    Array.isArray(currentDentist.speciality) &&
    currentDentist.speciality.some((s) => /ortodont/i.test(String(s)));

  if (isOrtho) {
    return currentDentist;
  }

  const defaultOrtho = await resolveOrthodontistDentist().catch(() => null);
  if (defaultOrtho && String(dentistId) === String(defaultOrtho._id)) {
    return defaultOrtho;
  }

  return null;
};

const notifyOrthodontQueueStatusIfPossible = async ({ dentist, entry }) => {
  try {
    if (!entry?.patientId) return;

    const status = String(entry?.status || "").trim();
    if (!["CALLED", "MISSED"].includes(status)) return;

    const patient = await userModel
      .findById(entry.patientId)
      .select("name telegram")
      .lean();

    const chatId = String(patient?.telegram?.chatId || "").trim();
    const isVerified = Boolean(patient?.telegram?.isVerified);

    if (!chatId || !isVerified) return;

    const text =
      status === "MISSED"
        ? buildOrthodontistMissedMessage({
            patientName: patient?.name,
            dentistName: dentist?.name,
            entry,
          })
        : buildOrthodontistCalledMessage({
            patientName: patient?.name,
            dentistName: dentist?.name,
            entry,
          });

    await sendTelegramWebhookReply({
      chatId,
      text,
      replyMarkup: buildTelegramMainReplyKeyboard(),
    });
  } catch (error) {
    console.error("notifyOrthodontQueueStatusIfPossible error:", error);
  }
};

export const dentistGetOrthodontistQueue = async (req, res) => {
  try {
    const dentist = await resolveRequesterDentist(req.dentistId);

    if (!dentist) {
      return res.json({
        success: false,
        message: "Bu akkaunt ortodont navbatini boshqara olmaydi",
      });
    }

    const dayKey = formatUzDayKey();
    const snapshot = await getOrthodontistQueueSnapshot({
      dentistId: dentist._id,
      dayKey,
    });

    return res.json({
      success: true,
      dentist,
      dayKey,
      snapshot,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};

export const dentistUpdateOrthodontistQueueStatus = async (req, res) => {
  try {
    const dentist = await resolveRequesterDentist(req.dentistId);

    if (!dentist) {
      return res.json({
        success: false,
        message: "Bu akkaunt ortodont navbatini boshqara olmaydi",
      });
    }

    const { id } = req.params;
    const { status, followUpDays = null } = req.body || {};

    const entry = await updateOrthodontistQueueStatus({
      entryId: id,
      dentistId: dentist._id,
      nextStatus: status,
      followUpDays,
    });

  await notifyOrthodontQueueStatusIfPossible({ dentist, entry });

    return res.json({
      success: true,
      message: "Navbat holati yangilandi",
      entry,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};

export const dentistCompleteOrthodontistQueue = async (req, res) => {
  try {
    const dentist = await resolveRequesterDentist(req.dentistId);

    if (!dentist) {
      return res.json({
        success: false,
        message: "Bu akkaunt ortodont navbatini boshqara olmaydi",
      });
    }

    const { id } = req.params;
    const rawFollowUpDays = Number(req.body?.followUpDays || 0);
    const followUpDays = [3, 7, 10, 15].includes(rawFollowUpDays)
      ? rawFollowUpDays
      : null;

    const result = await completeOrthodontistQueueEntry({
      entryId: id,
      dentistId: dentist._id,
      files: Array.isArray(req.files) ? req.files : [],
      followUpDays,
    });

    const message =
      result?.telegram?.ok === false &&
      result?.telegram?.code === "FOLLOW_UP_NOT_SELECTED"
        ? "Qabul tugatildi, lekin follow-up tanlanmagani uchun Telegram yuborilmadi"
        : "Qabul tugatildi";

    return res.json({
      success: true,
      message,
      entry: result.entry,
      telegram: result.telegram,
      reminders: result.reminders,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};

export const dentistConvertOrthodontistQueueToVisit = async (req, res) => {
  try {
    const dentist = await resolveRequesterDentist(req.dentistId);

    if (!dentist) {
      return res.json({
        success: false,
        message: "Bu akkaunt ortodont navbatini boshqara olmaydi",
      });
    }

    const { id } = req.params;
    const { firstVisit = false } = req.body || {};

    const appointment = await convertOrthodontistQueueToVisit({
      entryId: id,
      dentistId: dentist._id,
      firstVisit: Boolean(firstVisit),
    });

    return res.json({
      success: true,
      message: firstVisit
        ? "Birinchi ko‘rik yaratildi. Endi pastdagi uchrashuvlar ro‘yxatidan 'Ishni boshladim' ni bosing"
        : "Oddiy qabul yaratildi",
      appointmentId: appointment._id,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};

export const adminGetOrthodontistQueue = async (_req, res) => {
  try {
    const dentist = await resolveOrthodontistDentist();
    const dayKey = formatUzDayKey();

    const snapshot = await getOrthodontistQueueSnapshot({
      dentistId: dentist._id,
      dayKey,
    });

    return res.json({
      success: true,
      dentist,
      dayKey,
      snapshot,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};

export const adminUpdateOrthodontistQueueStatus = async (req, res) => {
  try {
    const dentist = await resolveOrthodontistDentist();
    const { id } = req.params;
    const { status, followUpDays = null } = req.body || {};

    const entry = await updateOrthodontistQueueStatus({
      entryId: id,
      dentistId: dentist._id,
      nextStatus: status,
      followUpDays,
    });

    await notifyOrthodontQueueStatusIfPossible({ dentist, entry });

    return res.json({
      success: true,
      message: "Navbat holati yangilandi",
      entry,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message || "Xatolik" });
  }
};
