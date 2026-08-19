import mongoose from "mongoose";

const telegramEventLogSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true, unique: true, index: true },

    eventType: {
      type: String,
      required: true,
      enum: ["PAYMENT_THANK_YOU", "POST_PAYMENT_NEXT_APPOINTMENT"],
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "treatment",
      required: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
      index: true,
    },

    nextAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
      index: true,
    },

    paymentRef: { type: String, default: "", index: true },

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

const telegramEventLogModel =
  mongoose.models.telegramEventLog ||
  mongoose.model("telegramEventLog", telegramEventLogSchema);

export default telegramEventLogModel;
