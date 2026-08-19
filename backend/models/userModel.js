import mongoose from "mongoose";
import Counter from "./counterModel.js";
import { buildLooseTextForms, normalizeText } from "../utils/text.js";

const PATIENT_ID_REGEX = /^B-\d+$/;

const INFECTIOUS_DISEASE_OPTIONS = ["Gepatit B", "Gepatit C", "SPID"];
const MAX_PATIENTS_PER_SHARED_CONTACT = 10;

const normalizeOptionalEmail = (email = "") => {
  const value = String(email || "").trim().toLowerCase();
  return value || "";
};

const normalizeDateOnly = (value = "") => String(value || "").slice(0, 10);

const escapeRegExp = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildNameForms = (value = "") => {
  const forms = new Set();

  for (const normalized of buildLooseTextForms(value || "")) {
    const tokens = normalized.split(" ").filter(Boolean);

    if (normalized) forms.add(normalized);

    const compact = tokens.join("");
    if (compact) forms.add(compact);

    if (tokens.length > 1) {
      const reversed = [...tokens].reverse();
      forms.add(reversed.join(" "));
      forms.add(reversed.join(""));
    }
  }

  return forms;
};

const getMaxExistingPatientSeq = async (UserModel) => {
  const users = await UserModel.find({
    patientId: { $regex: PATIENT_ID_REGEX },
  })
    .select("patientId")
    .lean();

  let maxSeq = 0;

  for (const user of users) {
    const match = String(user?.patientId || "").match(/^B-(\d+)$/);
    if (!match) continue;

    const num = Number(match[1]);
    if (Number.isFinite(num) && num > maxSeq) {
      maxSeq = num;
    }
  }

  return maxSeq;
};

const userSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    nameNormalized: { type: String, index: true },

    // REMOVE old uniqueness here
    email: { type: String },

    password: { type: String, default: "", select: false },
    needsPasswordSet: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },

    image: {
      type: String,
    },

    address: {
      type: Object,
      required: true,
      default: { line1: "", line2: "" },
    },

    gender: {
      type: String,
      enum: ["Erkak", "Ayol", "Tanlanmagan"],
      default: "Tanlanmagan",
    },

    DOB: { type: String, required: true },

    // REMOVE old uniqueness here
    phone: { type: String, required: true },

    infectiousDiseaseMarkers: {
      type: [String],
      default: [],
      select: false,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.every((value) => INFECTIOUS_DISEASE_OPTIONS.includes(value)),
        message: "Noto‘g‘ri infeksion belgi",
      },
    },
    allergy: { type: String, default: "" },
    medicalWarnings: { type: String, default: "" },
    note: { type: String, default: "" },

    telegram: {
      chatId: { type: String, default: "" },
      username: { type: String, default: "" },
      firstName: { type: String, default: "" },
      linkedAt: { type: Date, default: null },
      isVerified: { type: Boolean, default: false },
      familySelectedPatientId: { type: String, default: "" },
      familySelectedAt: { type: Date, default: null },
      pendingLink: {
        token: { type: String, default: "" },
        tokenHash: { type: String, default: "" },
        expiresAt: { type: Date, default: null },
        createdAt: { type: Date, default: null },
      },
      orthoQueueDraft: {
        purposeCode: { type: String, default: "" },
        purposeLabel: { type: String, default: "" },
        firstVisit: { type: Boolean, default: false },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        accuracy: { type: Number, default: null },
        createdAt: { type: Date, default: null },
      },
    },
  },
  { timestamps: true },
);

userSchema.index(
  { "telegram.chatId": 1 },
  {
    partialFilterExpression: {
      "telegram.chatId": { $type: "string", $gt: "" },
    },
    name: "telegram_chat_id_idx",
  },
);

userSchema.index(
  { "telegram.pendingLink.tokenHash": 1 },
  {
    partialFilterExpression: {
      "telegram.pendingLink.tokenHash": { $type: "string", $gt: "" },
    },
    name: "telegram_pending_token_hash_idx",
  },
);

userSchema.statics.MAX_PATIENTS_PER_SHARED_CONTACT =
  MAX_PATIENTS_PER_SHARED_CONTACT;

userSchema.statics.normalizeOptionalEmail = normalizeOptionalEmail;
userSchema.statics.normalizeDateOnly = normalizeDateOnly;
userSchema.statics.buildNameForms = buildNameForms;

userSchema.statics.isPatientNameEquivalent = function (left = "", right = "") {
  const a = buildNameForms(left);
  const b = buildNameForms(right);

  if (!a.size || !b.size) return false;

  for (const value of a) {
    if (b.has(value)) return true;
  }

  return false;
};

userSchema.statics.isSamePatientIdentity = function (user, { name, DOB } = {}) {
  if (!user) return false;

  return (
    normalizeDateOnly(user.DOB) === normalizeDateOnly(DOB) &&
    this.isPatientNameEquivalent(user.name, name)
  );
};

userSchema.statics.findUsersBySharedContact = async function ({
  phone,
  email,
  excludeUserId,
  extraFilter = {},
  select = "",
} = {}) {
  const conditions = [];

  if (phone) conditions.push({ phone });
  if (email) conditions.push({ email });

  if (!conditions.length) return [];

  const query = { ...extraFilter, $or: conditions };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  return this.find(query)
    .select(select)
    .sort({ createdAt: 1, _id: 1 });
};

userSchema.statics.findUsersByIdentity = async function ({
  name,
  DOB,
  excludeUserId,
  extraFilter = {},
  select = "",
} = {}) {
  const normalizedDob = normalizeDateOnly(DOB);
  const nameForms = [...buildNameForms(name)];

  if (!normalizedDob || !nameForms.length) return [];

  const query = {
    ...extraFilter,
    DOB: { $regex: `^${escapeRegExp(normalizedDob)}` },
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const candidates = await this.find(query)
    .select(select)
    .sort({ createdAt: 1, _id: 1 });

  return candidates.filter((user) =>
    this.isSamePatientIdentity(user, { name, DOB: normalizedDob }),
  );
};

userSchema.statics.checkSharedContactCapacity = async function ({
  phone,
  email,
  excludeUserId,
} = {}) {
  const result = {
    ok: true,
    phoneCount: 0,
    emailCount: 0,
    field: "",
    message: "",
  };

  const excludeFilter = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

  if (phone) {
    result.phoneCount = await this.countDocuments({
      ...excludeFilter,
      phone,
    });

    if (result.phoneCount >= MAX_PATIENTS_PER_SHARED_CONTACT) {
      result.ok = false;
      result.field = "phone";
      result.message = `Bitta telefon raqam bilan ko‘pi bilan ${MAX_PATIENTS_PER_SHARED_CONTACT} ta bemor ro‘yxatdan o‘tishi mumkin`;
      return result;
    }
  }

  if (email) {
    result.emailCount = await this.countDocuments({
      ...excludeFilter,
      email,
    });

    if (result.emailCount >= MAX_PATIENTS_PER_SHARED_CONTACT) {
      result.ok = false;
      result.field = "email";
      result.message = `Bitta email bilan ko‘pi bilan ${MAX_PATIENTS_PER_SHARED_CONTACT} ta bemor ro‘yxatdan o‘tishi mumkin`;
      return result;
    }
  }

  return result;
};

userSchema.pre("save", async function () {
  if (this.isModified("name") || this.isNew) {
    this.nameNormalized = normalizeText(this.name || "");
  }

  if (this.patientId) return;

  const UserModel = this.constructor;
  const maxExistingSeq = await getMaxExistingPatientSeq(UserModel);

  await Counter.findOneAndUpdate(
    { name: "patient" },
    { $max: { seq: maxExistingSeq } },
    { new: true, upsert: true },
  );

  const counter = await Counter.findOneAndUpdate(
    { name: "patient" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.patientId = `B-${counter.seq}`;
});

export default mongoose.models.user || mongoose.model("user", userSchema);