import crypto from "crypto";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import appointmentReminderLogModel from "../models/appointmentReminderLogModel.js";
import { sendTelegramMessage, isTelegramConfigured } from "./telegramBot.js";
import {
  buildReminderMoments,
  formatUzDate,
  formatUzTime,
  isFutureWithinReminderRange,
  isWithinGraceWindow,
  nowUtc,
} from "../../shared/date.js";
import {
  buildAppointmentsButton,
  buildScheduledReminderMessage,
} from "./telegramMessageBuilders.js";

const buildReminderMessage = ({ patient, dentist, appointment, treatment }) => {
  const clinicName = process.env.CLINIC_NAME || "Magic Denta";
  const clinicAddress = process.env.CLINIC_ADDRESS || "";
  const clinicMapUrl = process.env.CLINIC_MAP_URL || "";

  const procedures =
    String(treatment?.procedures || appointment?.treatment || "").trim() ||
    "Oldingi muolaja haqida ma'lumot yo‘q";

  const nextStep =
    String(treatment?.nextStep || "").trim() ||
    "Shifokor ko‘rigiga asosan keyingi muolaja belgilanadi";

  const debt = Math.max(
    0,
    Number(
      treatment
        ? Number(treatment.amount || 0) - Number(treatment.paidAmount || 0)
        : appointment?.financial?.debt || 0,
    ),
  );

  return (
    `Assalomu alaykum, <b>${patient.name}</b>!\n\n` +
    `Sizga navbatdagi qabul haqida eslatma yubormoqdamiz.\n\n` +
    `🏥 <b>Klinika:</b> ${clinicName}\n` +
    (dentist?.name ? `👨‍⚕️ <b>Shifokor:</b> ${dentist.name}\n` : "") +
    `📅 <b>Sana:</b> ${formatUzDate(appointment.slotDate)}\n` +
    `⏰ <b>Vaqt:</b> ${formatUzTime(appointment.slotTime)}\n\n` +
    `🦷 <b>Oxirgi muolaja:</b> ${procedures}\n` +
    `➡️ <b>Keyingi reja:</b> ${nextStep}\n` +
    `💰 <b>Qarzdorlik:</b> ${
      debt > 0 ? formatMoneyUzs(debt) : "mavjud emas"
    }\n\n` +
    `📍 <b>Manzil:</b>\n` +
    `${clinicName}\n` +
    `${clinicAddress}\n` +
    `🗺 <a href="${clinicMapUrl}">Xaritada ochish</a>\n\n` +
    `Iltimos, belgilangan vaqtda tashrif buyuring.\n\n` +
    `Agar kelolmasangiz, qabulni bekor qilish yoki barcha qabullarni boshqarish uchun quyidagi tugmadan foydalaning.\n\n` +
    `Hurmat bilan,\n${clinicName}`
  );
};

const acquireReminderLock = async ({
  appointmentId,
  patientId,
  reminderType,
  scheduledFor,
  now,
  maxAttempts,
  lockTimeoutMs,
}) => {
  const lockId = crypto.randomUUID();
  const staleLockDate = new Date(now.getTime() - lockTimeoutMs);

  try {
    const doc = await appointmentReminderLogModel.findOneAndUpdate(
      {
        appointmentId,
        reminderType,
        $or: [
          { status: { $exists: false } },
          { status: "PENDING" },
          {
            status: "FAILED",
            attempts: { $lt: maxAttempts },
          },
          {
            status: "PROCESSING",
            lockedAt: { $lt: staleLockDate },
          },
        ],
      },
      {
        $setOnInsert: {
          appointmentId,
          reminderType,
          patientId,
          scheduledFor,
        },
        $set: {
          status: "PROCESSING",
          lockedAt: now,
          lockId,
          lastAttemptAt: now,
          error: "",
        },
        $inc: { attempts: 1 },
      },
      {
        new: true,
        upsert: true,
      },
    );

    if (!doc || doc.lockId !== lockId) return null;
    return doc;
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
};

const markReminderSent = async ({
  appointmentId,
  reminderType,
  lockId,
  messageId,
}) => {
  await appointmentReminderLogModel.updateOne(
    { appointmentId, reminderType, lockId, status: "PROCESSING" },
    {
      $set: {
        status: "SENT",
        sentAt: new Date(),
        error: "",
        telegramMessageId: messageId ? String(messageId) : "",
        lockedAt: null,
        lockId: "",
      },
    },
  );
};

const markReminderFailed = async ({
  appointmentId,
  reminderType,
  lockId,
  error,
}) => {
  await appointmentReminderLogModel.updateOne(
    { appointmentId, reminderType, lockId, status: "PROCESSING" },
    {
      $set: {
        status: "FAILED",
        error: String(error || ""),
        lockedAt: null,
        lockId: "",
      },
    },
  );
};

export const runTelegramReminderJob = async () => {
  if (!isTelegramConfigured()) return;

  const now = new Date();
  const maxAttempts = Math.max(
    1,
    Number(process.env.TELEGRAM_REMINDER_MAX_ATTEMPTS || 3),
  );
  const lockTimeoutMs =
    Math.max(1, Number(process.env.TELEGRAM_REMINDER_LOCK_MINUTES || 10)) *
    60 *
    1000;

  const appointments = await appointmentModel
    .find({
      cancelled: false,
      status: { $nin: ["DONE", "MISSED", "CANCELLED"] },
    })
    .populate("userId", "name telegram")
    .populate("dentistID", "name")
    .lean();

  for (const appointment of appointments) {
    try {
      const patient = appointment.userId;
      if (!patient?._id) continue;
      if (!patient?.telegram?.isVerified || !patient?.telegram?.chatId)
        continue;

      if (
        !isFutureWithinReminderRange({
          slotDate: appointment.slotDate,
          slotTime: appointment.slotTime,
        })
      ) {
        continue;
      }

      const moments = buildReminderMoments({
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime,
      });

      if (!moments?.length) continue;

      const treatment = await treatmentModel
        .findOne({ nextAppointmentId: appointment._id })
        .lean();

      for (const moment of moments) {
        if (!isWithinGraceWindow(moment.scheduledFor, now)) continue;

        const existing = await appointmentReminderLogModel
          .findOne({
            appointmentId: appointment._id,
            reminderType: moment.reminderType,
          })
          .lean();

        if (existing?.status === "SENT") continue;
        if (
          (existing?.attempts || 0) >= maxAttempts &&
          existing?.status !== "PROCESSING"
        ) {
          continue;
        }

        const acquired = await acquireReminderLock({
          appointmentId: appointment._id,
          patientId: patient._id,
          reminderType: moment.reminderType,
          scheduledFor: moment.scheduledFor,
          now,
          maxAttempts,
          lockTimeoutMs,
        });

        if (!acquired) continue;

         let messageText = "";
        try {
          messageText = buildScheduledReminderMessage({
            patient,
            dentist: appointment.dentistID,
            appointment,
            treatment,
            reminderType: moment.reminderType,
          });
        } catch (builderError) {
          await markReminderFailed({
            appointmentId: appointment._id,
            reminderType: moment.reminderType,
            lockId: acquired.lockId,
            error: builderError?.message || builderError,
          });

          console.error(
            `[telegram reminder] message build failed ${moment.reminderType} for appointment ${appointment._id}:`,
            builderError?.message || builderError,
          );
          continue;
        }

        try {
          const sendResult = await sendTelegramMessage({
            chatId: patient.telegram.chatId,
            text: messageText,
            replyMarkup: buildAppointmentsButton(),
          });

          await markReminderSent({
            appointmentId: appointment._id,
            reminderType: moment.reminderType,
            lockId: acquired.lockId,
            messageId: sendResult?.message_id,
          });
        } catch (sendError) {
          await markReminderFailed({
            appointmentId: appointment._id,
            reminderType: moment.reminderType,
            lockId: acquired.lockId,
            error: sendError?.message || sendError,
          });

          console.error(
            `[telegram reminder] failed ${moment.reminderType} for appointment ${appointment._id}:`,
            sendError?.message || sendError,
          );
        } finally {
          // 40ms delay ensures max 25 msg/sec to prevent Telegram rate-limit 429
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
      }
    } catch (error) {
      console.error(
        `[telegram reminder] appointment loop failed ${appointment?._id}:`,
        error?.message || error,
      );
    }
  }
};
