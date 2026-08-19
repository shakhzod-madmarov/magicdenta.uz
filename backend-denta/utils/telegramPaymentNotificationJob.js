import crypto from "crypto";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import telegramEventLogModel from "../models/telegramEventLogModel.js";
import { isTelegramConfigured, sendTelegramMessage } from "./telegramBot.js";
import {
  buildAppointmentsButton,
  buildPaymentThankYouMessage,
  buildPostPaymentNextAppointmentMessage,
} from "./telegramMessageBuilders.js";

const getDelayMs = (envKey, fallbackSeconds) =>
  Math.max(0, Number(process.env[envKey] || fallbackSeconds)) * 1000;

const getMaxAttempts = () =>
  Math.max(1, Number(process.env.TELEGRAM_EVENT_MAX_ATTEMPTS || 3));

const getLockTimeoutMs = () =>
  Math.max(1, Number(process.env.TELEGRAM_EVENT_LOCK_MINUTES || 10)) *
  60 *
  1000;

export const enqueuePostPaymentTelegramEvents = async ({
  treatmentId,
  paymentRef,
}) => {
  if (!treatmentId || !paymentRef) return;

  const treatment = await treatmentModel.findById(treatmentId).lean();
  if (!treatment) return;

  const payment = Array.isArray(treatment.payments)
    ? treatment.payments.find(
        (p) => String(p.paymentRef || "") === String(paymentRef),
      )
    : null;

  if (!payment) return;

  const paidAt = payment?.paidAt ? new Date(payment.paidAt) : new Date();

  const thankYouDate = new Date(
    paidAt.getTime() + getDelayMs("TELEGRAM_PAYMENT_MESSAGE_DELAY_SECONDS", 10),
  );

  const nextReminderDate = new Date(
    paidAt.getTime() +
      getDelayMs("TELEGRAM_NEXT_APPOINTMENT_AFTER_PAYMENT_DELAY_SECONDS", 30),
  );

  const baseDoc = {
    patientId: treatment.userId,
    treatmentId: treatment._id,
    appointmentId: treatment.appointmentId || null,
    nextAppointmentId: treatment.nextAppointmentId || null,
    paymentRef,
  };

  try {
    await telegramEventLogModel.create({
      ...baseDoc,
      eventKey: `PAYMENT_THANK_YOU:${treatment._id}:${paymentRef}`,
      eventType: "PAYMENT_THANK_YOU",
      scheduledFor: thankYouDate,
      status: "PENDING",
    });
  } catch (e) {
    if (e?.code !== 11000) throw e;
  }

  if (treatment.nextAppointmentId) {
    try {
      await telegramEventLogModel.create({
        ...baseDoc,
        eventKey: `POST_PAYMENT_NEXT_APPOINTMENT:${treatment._id}:${paymentRef}:${treatment.nextAppointmentId}`,
        eventType: "POST_PAYMENT_NEXT_APPOINTMENT",
        scheduledFor: nextReminderDate,
        status: "PENDING",
      });
    } catch (e) {
      if (e?.code !== 11000) throw e;
    }
  }
};

const acquireEventLock = async (eventId, now) => {
  const lockId = crypto.randomUUID();

  const doc = await telegramEventLogModel.findOneAndUpdate(
    {
      _id: eventId,
      status: { $in: ["PENDING", "FAILED"] },
    },
    {
      $set: {
        status: "PROCESSING",
        lockId,
        lockedAt: now,
        lastAttemptAt: now,
        error: "",
        skipReason: "",
      },
      $inc: { attempts: 1 },
    },
    { new: true },
  );

  if (!doc || doc.lockId !== lockId) return null;
  return doc;
};

const markSent = async (eventId, lockId, messageId) => {
  await telegramEventLogModel.updateOne(
    { _id: eventId, lockId, status: "PROCESSING" },
    {
      $set: {
        status: "SENT",
        sentAt: new Date(),
        telegramMessageId: messageId ? String(messageId) : "",
        lockId: "",
        lockedAt: null,
        error: "",
        skipReason: "",
      },
    },
  );
};

const markSkipped = async (eventId, lockId, reason) => {
  await telegramEventLogModel.updateOne(
    { _id: eventId, lockId, status: "PROCESSING" },
    {
      $set: {
        status: "SKIPPED",
        skipReason: String(reason || ""),
        lockId: "",
        lockedAt: null,
      },
    },
  );
};

const markFailed = async (eventId, lockId, error) => {
  await telegramEventLogModel.updateOne(
    { _id: eventId, lockId, status: "PROCESSING" },
    {
      $set: {
        status: "FAILED",
        error: String(error || ""),
        lockId: "",
        lockedAt: null,
      },
    },
  );
};

export const runTelegramPaymentNotificationJob = async () => {
  if (!isTelegramConfigured()) return;

  const now = new Date();
  const maxAttempts = getMaxAttempts();
  const staleDate = new Date(now.getTime() - getLockTimeoutMs());

  const events = await telegramEventLogModel
    .find({
      scheduledFor: { $lte: now },
      $or: [
        { status: "PENDING" },
        { status: "FAILED", attempts: { $lt: maxAttempts } },
        { status: "PROCESSING", lockedAt: { $lt: staleDate } },
      ],
    })
    .sort({ scheduledFor: 1, createdAt: 1 })
    .limit(20)
    .lean();

  for (const rawEvent of events) {
    try {
      const locked = await acquireEventLock(rawEvent._id, now);
      if (!locked) continue;

      const treatment = await treatmentModel
        .findById(locked.treatmentId)
        .populate("userId", "name telegram")
        .populate("dentistId", "name")
        .lean();

      if (!treatment) {
        await markSkipped(locked._id, locked.lockId, "TREATMENT_NOT_FOUND");
        continue;
      }

      const patient = treatment.userId;
      const dentist = treatment.dentistId;

      if (!patient?.telegram?.isVerified || !patient?.telegram?.chatId) {
        await markSkipped(locked._id, locked.lockId, "PATIENT_NOT_LINKED");
        continue;
      }

      const appointment = treatment.appointmentId
        ? await appointmentModel.findById(treatment.appointmentId).lean()
        : null;

      const payment = Array.isArray(treatment.payments)
        ? treatment.payments.find(
            (p) =>
              String(p.paymentRef || "") === String(locked.paymentRef || ""),
          )
        : null;

      if (!payment) {
        await markSkipped(locked._id, locked.lockId, "PAYMENT_NOT_FOUND");
        continue;
      }

      let text = "";
      const replyMarkup = buildAppointmentsButton();

      try {
        if (locked.eventType === "PAYMENT_THANK_YOU") {
          text = buildPaymentThankYouMessage({
            patient,
            dentist,
            appointment,
            treatment,
            payment,
          });
        } else if (locked.eventType === "POST_PAYMENT_NEXT_APPOINTMENT") {
          if (!treatment.nextAppointmentId) {
            await markSkipped(locked._id, locked.lockId, "NO_NEXT_APPOINTMENT");
            continue;
          }

          const nextAppointment = await appointmentModel
            .findById(treatment.nextAppointmentId)
            .lean();

          if (
            !nextAppointment ||
            nextAppointment.cancelled ||
            ["DONE", "MISSED", "CANCELLED"].includes(nextAppointment.status)
          ) {
            await markSkipped(
              locked._id,
              locked.lockId,
              "NEXT_APPOINTMENT_INVALID",
            );
            continue;
          }

          text = buildPostPaymentNextAppointmentMessage({
            patient,
            dentist,
            nextAppointment,
            treatment,
          });
        } else {
          await markSkipped(locked._id, locked.lockId, "UNKNOWN_EVENT_TYPE");
          continue;
        }
      } catch (builderError) {
        await markFailed(
          locked._id,
          locked.lockId,
          builderError?.message || builderError,
        );

        console.error(
          "[telegram payment event job] message build failed:",
          builderError?.message || builderError,
        );
        continue;
      }

      const result = await sendTelegramMessage({
        chatId: patient.telegram.chatId,
        text,
        replyMarkup,
      });

      await markSent(locked._id, locked.lockId, result?.message_id);
    } catch (error) {
      try {
        if (rawEvent?._id) {
          await telegramEventLogModel.updateOne(
            { _id: rawEvent._id, status: "PROCESSING" },
            {
              $set: {
                status: "FAILED",
                error: String(error?.message || error || ""),
                lockId: "",
                lockedAt: null,
              },
            },
          );
        }
      } catch {}

      console.error(
        "[telegram payment event job] failed:",
        error?.message || error,
      );
    }
  }
};