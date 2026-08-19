import mongoose from "mongoose";

const { Schema } = mongoose;

const xraySchema = new Schema(
  {
    path: { type: String, required: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const paymentSchema = new Schema(
  {
    paymentRef: { type: String, default: "", index: true },
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, required: true, default: Date.now },
    method: { type: String, default: "CASH" },
    source: { type: String, default: "ADMIN_CONFIRM" },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const amountHistorySchema = new Schema(
  {
    action: {
      type: String,
      default: "INITIAL_SET",
    },
    oldAmount: { type: Number, required: true, min: 0, default: 0 },
    newAmount: { type: Number, required: true, min: 0, default: 0 },
    reason: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },

    changedByRole: {
      type: String,
      enum: ["ADMIN", "DENTIST", "SYSTEM", "PATIENT", "RECEPTION", "USER"],
      default: "SYSTEM",
    },
    changedById: { type: String, default: "" },
    changedByName: { type: String, default: "" },

    confirmedDentistId: { type: String, default: "" },
    confirmedDentistName: { type: String, default: "" },
  },
  { _id: true },
);

const treatmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    dentistId: { type: Schema.Types.ObjectId, ref: "dentist", required: true },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
      unique: true,
    },

    diagnosis: { type: String, default: "" },
    teeth: { type: String, default: "" },
    procedures: { type: String, default: "" },
    nextStep: { type: String, default: "" },
    medicines: { type: String, default: "" },
    notes: { type: String, default: "" },
    sourceTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "template",
      default: null,
    },
    sourceTemplateTitle: { type: String, default: "" },
    nextVisitDate: { type: String, default: "" },
    nextVisitTime: { type: String, default: "" },
    xrays: { type: [xraySchema], default: [] },
    nextAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
    },

    amount: { type: Number, required: true, default: 0, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
    },
    payments: { type: [paymentSchema], default: [] },
    amountHistory: { type: [amountHistorySchema], default: [] },

    lastPaidAt: { type: Date, default: null },
    requestedPaidNow: { type: Number, default: 0, min: 0 },
    requestedPaidNowAt: { type: Date, default: null },
    commission: {
      percentAtTreatment: { type: Number, default: 30 },
      calculatedShare: { type: Number, default: 0 },
      payoutStatus: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
      payoutId: { type: Schema.Types.ObjectId, ref: 'commissionPayout', default: null }
    },
    isHistorical: { type: Boolean, default: false },
  },
  { timestamps: true },
);

treatmentSchema.virtual("debt").get(function () {
  const d = (this.amount || 0) - (this.paidAmount || 0);
  return d > 0 ? d : 0;
});

const treatmentModel =
  mongoose.models.treatment || mongoose.model("treatment", treatmentSchema);

export default treatmentModel;