import mongoose from "mongoose";
import Counter from "./counterModel.js";

const dayScheduleSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true }, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    isOpen: { type: Boolean, default: true },
    start: { type: String, default: "08:00" },
    end: { type: String, default: "18:00" },
  },
  { _id: false }
);

const dentistSchema = new mongoose.Schema(
  {
    dentistId: {
      type: String,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    speciality: { type: [String], default: [] },
    degree: { type: String, default: "" },
    experience: { type: Number, default: 0, min: 0 },
    about: { type: String, default: "" },
    available: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    commissionPercent: { type: Number, default: 30, min: 0, max: 100 },
    slots_booked: { type: Object, default: {}, required: true },
    workingSchedule: {
      type: [dayScheduleSchema],
      default: undefined,
    },
    date: { type: Number, default: Date.now },
    telegram: {
      chatId: { type: String, default: "" },
      username: { type: String, default: "" },
      firstName: { type: String, default: "" },
      linkedAt: { type: Date, default: null },
      isVerified: { type: Boolean, default: false },
      pendingLink: {
        token: { type: String, default: "" },
        tokenHash: { type: String, default: "" },
        expiresAt: { type: Date, default: null },
        createdAt: { type: Date, default: null },
      },
    },
  },
  { minimize: false },
);

dentistSchema.index(
  { "telegram.chatId": 1 },
  {
    partialFilterExpression: {
      "telegram.chatId": { $type: "string", $gt: "" },
    },
    name: "dentist_telegram_chat_id_idx",
  },
);

dentistSchema.index(
  { "telegram.pendingLink.tokenHash": 1 },
  {
    partialFilterExpression: {
      "telegram.pendingLink.tokenHash": { $type: "string", $gt: "" },
    },
    name: "dentist_telegram_pending_token_hash_idx",
  },
);

const getMaxExistingDentistSeq = async (DentistModel) => {
  const dentists = await DentistModel.find({
    dentistId: { $regex: /^D-\d+$/ },
  })
    .select("dentistId")
    .lean();

  let maxSeq = 0;

  for (const dentist of dentists) {
    const match = String(dentist?.dentistId || "").match(/^D-(\d+)$/);
    if (!match) continue;

    const num = Number(match[1]);
    if (Number.isFinite(num) && num > maxSeq) {
      maxSeq = num;
    }
  }

  return maxSeq;
};

dentistSchema.pre("save", async function () {
  if (this.dentistId) return;

  const DentistModel = this.constructor;

  const maxExistingSeq = await getMaxExistingDentistSeq(DentistModel);

  await Counter.findOneAndUpdate(
    { name: "dentist" },
    { $max: { seq: maxExistingSeq } },
    { new: true, upsert: true },
  );

  const counter = await Counter.findOneAndUpdate(
    { name: "dentist" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.dentistId = `D-${counter.seq}`;
});

const dentistModel =
  mongoose.models.dentist || mongoose.model("dentist", dentistSchema);

export default dentistModel;
