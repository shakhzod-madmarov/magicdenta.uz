import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    dentistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
    },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    date: { type: Number, required: true },
    durationMinutes: { type: Number, default: 60 },

    createdFrom: {
      type: String,
      enum: ["USER", "ADMIN", "DENTIST"],
      default: "USER",
    },

    status: {
      type: String,
      enum: ["WAITING", "IN_PROGRESS", "DONE", "MISSED", "CANCELLED"],
      default: "WAITING",
    },

    cancelled: { type: Boolean, default: false },
    startedAt: { type: Number, default: null },

    isWalkIn: { type: Boolean, default: false },
    walkInNote: { type: String, default: "" },
    appointmentType: {
      type: String,
      enum: ["NORMAL", "ORTHODONTIC", "GENERAL"],
      default: "NORMAL",
    },
    isHistorical: { type: Boolean, default: false },

    rescheduled: { type: Boolean, default: false },
    rescheduledBy: {
      type: String,
      enum: ["ADMIN", "DENTIST", "USER"],
      default: null,
    },
    rescheduledByName: { type: String, default: "" },
    rescheduledAt: { type: Number, default: null },
    rescheduleHistory: [
      {
        oldSlotDate: { type: String },
        oldSlotTime: { type: String },
        newSlotDate: { type: String },
        newSlotTime: { type: String },
        rescheduledBy: { type: String },
        rescheduledByName: { type: String },
        rescheduledAt: { type: Number },
        reason: { type: String, default: "" },
      },
    ],

    diagnosis: { type: String, default: "" },
    treatment: { type: String, default: "" },

    financial: {
      amount: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      debt: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        enum: ["UNPAID", "PARTIAL", "PAID"],
        default: "UNPAID",
      },
      lastPaidAt: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ dentistID: 1, date: -1 });

appointmentSchema.index({ dentistID: 1, slotDate: 1 });

appointmentSchema.index({ userId: 1 });

appointmentSchema.index({ status: 1, slotDate: 1 });

appointmentSchema.index(
  {
    dentistID: 1,
    slotDate: 1,
    cancelled: 1,
    status: 1,
    slotTime: 1,
    createdAt: 1,
  },
  { name: "queue_today_idx" },
);

export default mongoose.model("appointment", appointmentSchema);
