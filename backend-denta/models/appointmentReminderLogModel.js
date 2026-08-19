import mongoose from "mongoose";

const appointmentReminderLogSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    reminderType: {
      type: String,
      required: true,
      enum: [
        "BEFORE_7_DAYS",
        "BEFORE_3_DAYS",
        "BEFORE_1_DAY",
        "SAME_DAY_0700",
        "BEFORE_3_HOURS",
      ],
    },
    scheduledFor: { type: Date, required: true },
    sentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      default: "PENDING",
    },
    attempts: { type: Number, default: 0 },
    error: { type: String, default: "" },
    lockedAt: { type: Date, default: null },
    lockId: { type: String, default: "" },
    telegramMessageId: { type: String, default: "" },
    lastAttemptAt: { type: Date, default: null },
  },
  { timestamps: true },
);

appointmentReminderLogSchema.index(
  { appointmentId: 1, reminderType: 1 },
  { unique: true, name: "appointment_reminder_unique_idx" },
);

const appointmentReminderLogModel =
  mongoose.models.appointmentReminderLog ||
  mongoose.model("appointmentReminderLog", appointmentReminderLogSchema);

export default appointmentReminderLogModel;
