import crypto from "crypto";
import dentistModel from "../models/dentistModel.js";
import userModel from "../models/userModel.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";
import orthodontistFollowUpReminderLogModel from "../models/orthodontistFollowUpReminderLogModel.js";
import { isTelegramConfigured, sendTelegramMessage } from "./telegramBot.js";
import {
  buildAppointmentsButton,
  buildOrthodontistFollowUpReminderMessage,
} from "./telegramMessageBuilders.js";

const getMaxAttempts = () =>
  Math.max(1, Number(process.env.TELEGRAM_EVENT_MAX_ATTEMPTS || 3));

const getLockTimeoutMs = () =>
  Math.max(1, Number(process.env.TELEGRAM_EVENT_LOCK_MINUTES || 10)) *
  60 *
  1000;

const acquireEventLock = async (eventId, now) => {
  const lockId = crypto.randomUUID();
  const maxAttempts = getMaxAttempts();
  const staleDate = new Date(now.getTime() - getLockTimeoutMs());

  const doc = await orthodontistFollowUpReminderLogModel.findOneAndUpdate(
    {
      _id: eventId,
      $or: [
        { status: "PENDING" },
        { status: "FAILED", attempts: { $lt: maxAttempts } },
        { status: "PROCESSING", lockedAt: { $lt: staleDate } },
      ],
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
  await orthodontistFollowUpReminderLogModel.updateOne(
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
  await orthodontistFollowUpReminderLogModel.updateOne(
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
  await orthodontistFollowUpReminderLogModel.updateOne(
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

export const runOrthodontistFollowUpReminderJob = async () => {
  if (!isTelegramConfigured()) return;

  const now = new Date();
  const maxAttempts = getMaxAttempts();
  const staleDate = new Date(now.getTime() - getLockTimeoutMs());

  const events = await orthodontistFollowUpReminderLogModel
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

      const entry = await orthodontistQueueModel.findById(
        locked.orthodontistQueueId,
      );

      if (!entry) {
        await markSkipped(locked._id, locked.lockId, "QUEUE_ENTRY_NOT_FOUND");
        continue;
      }

      if (String(entry.status || "") !== "DONE") {
        await markSkipped(locked._id, locked.lockId, "QUEUE_NOT_DONE");
        continue;
      }

      const patient = await userModel
        .findById(entry.patientId)
        .select("name telegram")
        .lean();

      if (!patient?.telegram?.isVerified || !patient?.telegram?.chatId) {
        await markSkipped(locked._id, locked.lockId, "PATIENT_NOT_LINKED");
        continue;
      }

      const dentist = await dentistModel
        .findById(entry.dentistId)
        .select("name")
        .lean();

      let text = "";
      try {
        text = buildOrthodontistFollowUpReminderMessage({
          patient,
          dentist,
          entry,
          reminderType: locked.reminderType,
        });
      } catch (builderError) {
        await markFailed(
          locked._id,
          locked.lockId,
          builderError?.message || builderError,
        );
        continue;
      }

      const result = await sendTelegramMessage({
        chatId: patient.telegram.chatId,
        text,
        replyMarkup: buildAppointmentsButton(),
      });

      await markSent(locked._id, locked.lockId, result?.message_id);
    } catch (error) {
      try {
        if (rawEvent?._id) {
          await orthodontistFollowUpReminderLogModel.updateOne(
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
        "[telegram orthodontist follow-up job] failed:",
        error?.message || error,
      );
    }
  }
};
