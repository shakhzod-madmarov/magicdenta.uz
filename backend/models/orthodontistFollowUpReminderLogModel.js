import mongoose from "mongoose";

const orthodontistFollowUpReminderLogSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true, unique: true, index: true },

    orthodontistQueueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orthodontistQueue",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },

    reminderType: {
      type: String,
      required: true,
      enum: [
        "AFTER_10_SECONDS",
        "BEFORE_10_DAYS",
        "BEFORE_7_DAYS",
        "BEFORE_3_DAYS",
        "BEFORE_1_DAY",
        "SAME_DAY_0700",
      ],
      index: true,
    },

    followUpDays: {
      type: Number,
      enum: [3, 7, 10, 15],
      required: true,
    },

    nextPlannedDate: {
      type: String,
      required: true,
      default: "",
    },

    scheduledFor: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SENT", "SKIPPED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    attempts: { type: Number, default: 0 },
    error: { type: String, default: "" },
    skipReason: { type: String, default: "" },

    lockedAt: { type: Date, default: null },
    lockId: { type: String, default: "" },
    lastAttemptAt: { type: Date, default: null },
    telegramMessageId: { type: String, default: "" },
  },
  { timestamps: true },
);

orthodontistFollowUpReminderLogSchema.index({ status: 1, scheduledFor: 1 });

const orthodontistFollowUpReminderLogModel =
  mongoose.models.orthodontistFollowUpReminderLog ||
  mongoose.model(
    "orthodontistFollowUpReminderLog",
    orthodontistFollowUpReminderLogSchema,
  );

export default orthodontistFollowUpReminderLogModel;
