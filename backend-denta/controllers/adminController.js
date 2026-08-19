import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import dentistModel from "../models/dentistModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import userModel from "../models/userModel.js";
import { releaseLocksByAppointment } from "../utils/schedule.js";
import { buildNowSlot } from "../../shared/date.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";
import commissionPayoutModel from "../models/commissionPayoutModel.js";
import expenseModel from "../models/expenseModel.js";
import clinicSettingsModel from "../models/clinicSettingsModel.js";
import activityLogModel from "../models/activityLogModel.js";
import appointmentReminderLogModel from "../models/appointmentReminderLogModel.js";
import orthodontistFollowUpReminderLogModel from "../models/orthodontistFollowUpReminderLogModel.js";
import appointmentSlotLockModel from "../models/appointmentSlotLockModel.js";
import telegramEventLogModel from "../models/telegramEventLogModel.js";
import notificationModel from "../models/notificationModel.js";
import counterModel from "../models/counterModel.js";
import dentistLiveStatusModel from "../models/dentistLiveStatusModel.js";
import { logActivity } from "../utils/activityLogger.js";
import { updateEnvFile } from "../utils/envHelper.js";

import fs from "fs";
import path from "path";
import {
  ensureDir,
  deletePublicFileByUrl,
  buildPatientImageFileName,
  buildDentistImageFileName,
  buildPatientXrayFileName,
  safeFilenamePart,
  safeRelPath,
} from "../utils/files.js";
import {
  prepareImageForJpegStorage,
  writePreparedImageToFile,
} from "../utils/sanitizeImage.js";
import { normalizeDigits, normalizePhone } from "../utils/phone.js";
import {
  formatMoneyPlain,
  isoToday,
  parseUzDateTimeToUtcDate,
} from "../../shared/date.js";
import { enqueuePostPaymentTelegramEvents } from "../utils/telegramPaymentNotificationJob.js";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const INFECTIOUS_DISEASE_OPTIONS = ["Gepatit B", "Gepatit C", "SPID"];

const normalizeInfectiousDiseaseMarkers = (value) => {
  let list = value;

  if (typeof list === "string") {
    const trimmed = list.trim();

    if (!trimmed) return [];

    try {
      list = JSON.parse(trimmed);
    } catch {
      list = trimmed.split(",");
    }
  }

  if (!Array.isArray(list)) return [];

  return Array.from(
    new Set(
      list
        .map((item) => String(item || "").trim())
        .filter((item) => INFECTIOUS_DISEASE_OPTIONS.includes(item)),
    ),
  );
};

const verifyAdminSensitivePassword = (password) => {
  const raw = String(password || "");
  return Boolean(raw) && raw === String(process.env.ADMIN_PASSWORD || "");
};



const findDuplicateBySharedContactAndDob = async ({
  phone,
  email,
  DOB,
  excludeUserId,
} = {}) => {
  const normalizedDob = userModel.normalizeDateOnly(DOB);
  if (!normalizedDob) return null;

  const shared = await userModel.findUsersBySharedContact({
    phone,
    email,
    excludeUserId,
    select: "patientId name DOB phone email",
  });

  return (
    shared.find(
      (user) => userModel.normalizeDateOnly(user?.DOB) === normalizedDob,
    ) || null
  );
};
const verifyDentistSensitivePassword = async (dentistId, password) => {
  const raw = String(password || "");
  if (!dentistId || !raw) return false;

  const dentist = await dentistModel.findById(dentistId).select("+password");
  if (!dentist?.password) return false;

  return bcrypt.compare(raw, dentist.password);
};

const pushAmountHistory = (treatment, entry = {}) => {
  treatment.amountHistory = Array.isArray(treatment.amountHistory)
    ? treatment.amountHistory
    : [];

  treatment.amountHistory.push({
    action: entry.action || "INITIAL_SET",
    oldAmount: Math.max(0, toNum(entry.oldAmount)),
    newAmount: Math.max(0, toNum(entry.newAmount)),
    reason: String(entry.reason || "").trim(),
    changedAt: entry.changedAt instanceof Date ? entry.changedAt : new Date(),
    changedByRole: entry.changedByRole || "SYSTEM",
    changedById: String(entry.changedById || ""),
    changedByName: String(entry.changedByName || ""),
    confirmedDentistId: String(entry.confirmedDentistId || ""),
    confirmedDentistName: String(entry.confirmedDentistName || ""),
  });
};

const paymentStatusFrom = (amount, paid) => {
  if (amount <= 0) return "UNPAID";
  if (paid >= amount) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "UNPAID";
};

const applyPaymentToTreatment = (treatment, extraAmount, meta = {}) => {
  const extra = Math.max(0, toNum(extraAmount));
  if (extra <= 0) return { added: 0, paymentRef: "" };

  const amount = Math.max(0, toNum(treatment.amount));
  const paid = Math.max(0, toNum(treatment.paidAmount));
  const debt = Math.max(0, amount - paid);
  const add = Math.min(extra, debt);

  if (add <= 0) return { added: 0, paymentRef: "" };

  const paidAt = meta.paidAt instanceof Date ? meta.paidAt : new Date();
  const paymentRef = meta.paymentRef || crypto.randomUUID();

  treatment.payments = Array.isArray(treatment.payments)
    ? treatment.payments
    : [];
  treatment.payments.push({
    paymentRef,
    amount: add,
    paidAt,
    method: meta.method || "CASH",
    source: meta.source || "ADMIN_CONFIRM",
    note: meta.note || "",
  });

  treatment.lastPaidAt = paidAt;
  treatment.paidAmount = Math.min(amount, paid + add);
  treatment.paymentStatus = paymentStatusFrom(amount, treatment.paidAmount);

  return { added: add, paymentRef };
};

const syncAppointmentFinancialFromTreatment = (appointment, treatment) => {
  if (!appointment) return;

  const amount = Math.max(0, Number(treatment.amount || 0));
  const paidAmount = Math.max(0, Number(treatment.paidAmount || 0));
  const requestedPaidNow = Math.max(0, Number(treatment.requestedPaidNow || 0));

  appointment.financial = appointment.financial || {};
  appointment.financial.amount = amount;
  appointment.financial.paidAmount = paidAmount;
  appointment.financial.debt = Math.max(0, amount - paidAmount);
  appointment.financial.paymentStatus = treatment.paymentStatus || "UNPAID";
  appointment.financial.lastPaidAt = treatment.lastPaidAt
    ? new Date(treatment.lastPaidAt).getTime()
    : null;
  appointment.financial.requestedPaidNow = requestedPaidNow;
  appointment.financial.requestedPaidNowAt = treatment.requestedPaidNowAt
    ? new Date(treatment.requestedPaidNowAt).getTime()
    : null;
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", id: "admin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );

      return res.json({ success: true, token });
    }

    return res.json({ success: false, message: "Noto'g'ri ma'lumotlar" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const addDentist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      speciality,
      degree,
      experience,
      about,
      gender,
      available,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.json({
        success: false,
        message: "Ism, email, parol va telefon majburiy",
      });
    }

    if (!validator.isEmail(String(email))) {
      return res.json({ success: false, message: "Email noto'g'ri" });
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    const phoneTrimmed = String(phone).trim();

    const exists = await dentistModel.findOne({
      $or: [{ email: emailTrimmed }, { phone: phoneTrimmed }],
    });
    if (exists) {
      return res.json({
        success: false,
        message: "Bu email yoki telefon bilan stomatolog allaqachon mavjud",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    let specialityArr = [];

    if (typeof speciality === "string" && speciality.trim()) {
      try {
        specialityArr = JSON.parse(speciality);
      } catch {
        specialityArr = [];
      }
    } else if (Array.isArray(speciality)) {
      specialityArr = speciality;
    }

    const preparedDentistImage = req.file?.buffer
      ? await prepareImageForJpegStorage(req.file.buffer, {
          originalName: req.file.originalname,
        })
      : null;

    const dentist = await dentistModel.create({
      name: String(name).trim(),
      email: emailTrimmed,
      phone: phoneTrimmed,
      password: hashedPassword,
      image: "",
      speciality: specialityArr,
      degree: degree ? String(degree) : "",
      experience: Number(experience) || 0,
      about: about ? String(about) : "",
      gender: gender === "female" ? "female" : "male",
      available: available === undefined ? true : (available === "true" || available === true),
      date: Date.now(),
    });

    if (req.file && req.file.buffer) {
      const fileName = buildDentistImageFileName({
        dentistId: dentist.dentistId || String(dentist._id),
        dentistName: dentist.name,
        ext: ".jpg",
      });

      const targetDir = path.join(
        process.cwd(),
        "uploads",
        "public",
        "dentists",
      );
      ensureDir(targetDir);

      const absPath = path.join(targetDir, fileName);
      await writePreparedImageToFile(preparedDentistImage, absPath);

      dentist.image = `/uploads/dentists/${fileName}`;
      await dentist.save();
    }

    return res.json({
      success: true,
      message: "Stomatolog muvaffaqiyatli qo'shildi",
      dentist,
    });
  } catch (error) {
    console.error("addDentist error:", error);

    if (error?.code === 11000) {
      if (error?.keyPattern?.dentistId) {
        return res.json({
          success: false,
          message:
            "Stomatolog ID yaratishda vaqtinchalik ziddiyat yuz berdi. Qaytadan urinib ko‘ring.",
        });
      }

      if (error?.keyPattern?.email || error?.keyPattern?.phone) {
        return res.json({
          success: false,
          message: "Bu email yoki telefon bilan stomatolog allaqachon mavjud",
        });
      }
    }

    return res.json({ success: false, message: error.message });
  }
};

export const allDentists = async (req, res) => {
  try {
    const includeArchived =
      String(req.query?.includeArchived || "").trim() === "1" ||
      String(req.query?.includeArchived || "").trim().toLowerCase() ===
        "true";

    const filter = includeArchived ? {} : { isArchived: { $ne: true } };
    const dentists = await dentistModel.find(filter).select("-password");
    return res.json({ success: true, dentists });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const changeDentistAvailability = async (req, res) => {
  try {
    const { dentistId } = req.body;

    const dent = await dentistModel.findById(dentistId);
    if (!dent) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    dent.available = !dent.available;
    await dent.save();

    return res.json({ success: true, message: "Holat yangilandi" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const setDentistArchived = async (req, res) => {
  try {
    const { id } = req.params;
    const isArchived =
      req.body?.isArchived === true ||
      String(req.body?.isArchived || "").trim().toLowerCase() === "true";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        success: false,
        message: "Noto‘g‘ri stomatolog ID",
      });
    }

    const dentist = await dentistModel.findById(id).select("-password");
    if (!dentist) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    dentist.isArchived = isArchived;
    await dentist.save();

    return res.json({
      success: true,
      message: isArchived
        ? "Stomatolog arxivga o‘tkazildi"
        : "Stomatolog arxivdan chiqarildi",
      dentist,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const adminGetAllAppointments = async (req, res) => {
  try {
    const apps = await appointmentModel
      .find({})
      .populate("userId", "name phone patientId +infectiousDiseaseMarkers")
      .populate("dentistID", "name image isArchived")
      .sort({ date: -1 })
      .lean();

    const appointmentIds = apps.map((a) => a._id);

    const [treatments, queues] = await Promise.all([
      treatmentModel
        .find({ appointmentId: { $in: appointmentIds } })
        .select(
          "appointmentId amount paidAmount paymentStatus payments lastPaidAt requestedPaidNow requestedPaidNowAt",
        )
        .lean(),
      orthodontistQueueModel
        .find({ appointmentId: { $in: appointmentIds } })
        .select("appointmentId queueNo")
        .lean(),
    ]);

    const treatmentMap = new Map();
    for (const t of treatments) {
      const amount = Math.max(0, Number(t.amount || 0));
      const paidAmount = Math.max(0, Number(t.paidAmount || 0));
      const debt = Math.max(0, amount - paidAmount);

      const lastPaidAt =
        t.lastPaidAt ||
        (Array.isArray(t.payments) && t.payments.length
          ? t.payments[t.payments.length - 1]?.paidAt
          : null);

      treatmentMap.set(String(t.appointmentId), {
        _id: t._id,
        treatmentId: t._id,
        amount,
        paidAmount,
        debt,
        paymentStatus:
          t.paymentStatus ||
          (paidAmount >= amount
            ? "PAID"
            : paidAmount > 0
              ? "PARTIAL"
              : "UNPAID"),
        lastPaidAt,
        requestedPaidNow: Math.max(0, Number(t.requestedPaidNow || 0)),
        requestedPaidNowAt: t.requestedPaidNowAt || null,
      });
    }

    const queueMap = new Map();
    for (const q of queues) {
      if (q.appointmentId) {
        queueMap.set(String(q.appointmentId), q.queueNo);
      }
    }

    const allGroups = {};
    for (const a of apps) {
      if (!a.cancelled && a.slotDate) {
        const dentistIdStr = String(a.dentistID?._id || a.dentistID || "");
        if (dentistIdStr) {
          const key = `${dentistIdStr}_${a.slotDate}`;
          if (!allGroups[key]) allGroups[key] = [];
          allGroups[key].push(a);
        }
      }
    }

    const dynamicQueueMap = new Map();
    for (const key in allGroups) {
      const group = allGroups[key];
      group.sort((x, y) => {
        // Sort chronologically by slotTime, then by createdAt to keep queue numbers stable
        const timeDiff = String(x.slotTime || "").localeCompare(String(y.slotTime || ""));
        if (timeDiff !== 0) return timeDiff;
        return new Date(x.createdAt || 0) - new Date(y.createdAt || 0);
      });

      group.forEach((item, index) => {
        dynamicQueueMap.set(String(item._id), index + 1);
      });
    }

    const mapped = apps.map((a) => {
      const fin = treatmentMap.get(String(a._id)) || a.financial || null;
      const qNo = queueMap.get(String(a._id)) || dynamicQueueMap.get(String(a._id)) || null;

      return {
        _id: a._id,
        slotDate: a.slotDate,
        slotTime: a.slotTime,
        date: a.date,
        status: a.status,
        cancelled: Boolean(a.cancelled),
        isWalkIn: a.isWalkIn,
        appointmentType: a.appointmentType || "NORMAL",
        queueNo: qNo,
        userData: a.userId
          ? {
              name: a.userId.name,
              phone: a.userId.phone,
              patientId: a.userId.patientId,
              hasInfectiousDiseaseMarker:
                Array.isArray(a.userId.infectiousDiseaseMarkers) &&
                a.userId.infectiousDiseaseMarkers.length > 0,
            }
          : null,

        dentistData: a.dentistID
          ? {
              name: a.dentistID.name,
              image: a.dentistID.image,
              isArchived: Boolean(a.dentistID.isArchived),
            }
          : null,

        financial: fin,
      };
    });

    return res.json({ success: true, appointments: mapped });
  } catch (error) {
    console.error("adminGetAllAppointments error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const parseSpeciality = (speciality) => {
  if (typeof speciality === "string" && speciality.trim()) {
    try {
      const arr = JSON.parse(speciality);
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(speciality) ? speciality.filter(Boolean) : [];
};

export const adminUpdateDentist = async (req, res) => {
  try {
    const { id } = req.params;

    let { name, phone, email, gender, degree, experience, speciality, about } =
      req.body;

    const dentist = await dentistModel.findById(id);
    if (!dentist)
      return res.json({ success: false, message: "Stomatolog topilmadi" });

    name = String(name || "").trim();
    email = String(email || "")
      .trim()
      .toLowerCase();
    phone = String(phone || "").trim();

    if (name.length < 3)
      return res.json({ success: false, message: "Ism noto‘g‘ri" });
    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Email noto‘g‘ri" });

    const phoneDigits = normalizeDigits(phone);
    let normalizedPhone = phoneDigits;
    if (normalizedPhone.startsWith("998"))
      normalizedPhone = "+" + normalizedPhone;
    else if (normalizedPhone.length === 9)
      normalizedPhone = "+998" + normalizedPhone;
    else if (normalizedPhone.startsWith("0") && normalizedPhone.length >= 10) {
      normalizedPhone = "+998" + normalizedPhone.slice(-9);
    } else if (normalizedPhone.startsWith("+998")) {
    } else if (!normalizedPhone.startsWith("+998")) {
      normalizedPhone = phone;
    }

    const finalDigits = normalizeDigits(normalizedPhone);
    if (!(finalDigits.length === 12 && finalDigits.startsWith("998"))) {
      return res.json({ success: false, message: "Telefon noto‘g‘ri" });
    }
    normalizedPhone = "+998" + finalDigits.slice(3);

    const exp = Number(experience);
    if (!Number.isFinite(exp) || exp < 0 || exp > 50)
      return res.json({ success: false, message: "Tajriba noto‘g‘ri" });

    const specialityArr = parseSpeciality(speciality);
    if (!specialityArr.length)
      return res.json({ success: false, message: "Mutaxassislik tanlanmagan" });

    degree = String(degree || "").trim();
    if (!degree)
      return res.json({ success: false, message: "Daraja majburiy" });

    about = String(about || "").trim();
    if (about.length < 10)
      return res.json({
        success: false,
        message: "Haqida kamida 10 ta belgi bo‘lsin",
      });

    const others = await dentistModel
      .find({ _id: { $ne: id } })
      .select("email phone")
      .lean();

    const phoneDup = others.some(
      (d) => normalizeDigits(d.phone) === normalizeDigits(normalizedPhone),
    );
    if (phoneDup)
      return res.json({
        success: false,
        message: "Bu telefon allaqachon mavjud",
      });

    const emailDup = others.some(
      (d) => String(d.email || "").toLowerCase() === email,
    );
    if (emailDup)
      return res.json({
        success: false,
        message: "Bu email allaqachon mavjud",
      });

    const oldImage = dentist.image;
    const preparedDentistImage = req.file?.buffer
      ? await prepareImageForJpegStorage(req.file.buffer, {
          originalName: req.file.originalname,
        })
      : null;

    if (preparedDentistImage) {
      const fileName = buildDentistImageFileName({
        dentistId: dentist.dentistId || String(dentist._id),
        dentistName: name?.trim() || dentist.name,
        ext: ".jpg",
      });

      const targetDir = path.join(
        process.cwd(),
        "uploads",
        "public",
        "dentists",
      );
      ensureDir(targetDir);

      const absPath = path.join(targetDir, fileName);
      await writePreparedImageToFile(preparedDentistImage, absPath);

      dentist.image = `/uploads/dentists/${fileName}`;
    }

    dentist.name = name;
    dentist.email = email;
    dentist.phone = normalizedPhone;
    dentist.gender = gender === "female" ? "female" : "male";
    dentist.degree = degree;
    dentist.experience = exp;
    dentist.about = about;
    dentist.speciality = specialityArr;

    await dentist.save();

    if (
      preparedDentistImage &&
      oldImage &&
      oldImage !== dentist.image &&
      String(oldImage).startsWith("/uploads/dentists/")
    ) {
      deletePublicFileByUrl(oldImage);
    }

    return res.json({
      success: true,
      message: "Akkaunt muvaffaqiyatli yangilandi",
      dentist,
    });
  } catch (e) {
    if (e?.code === 11000) {
      return res.json({
        success: false,
        message: "Email yoki telefon takrorlangan",
      });
    }
    return res.json({ success: false, message: e.message });
  }
};

export const adminDentistDetails = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({
      success: false,
      message: "Noto‘g‘ri stomatolog ID",
    });
  }

  const dentist = await dentistModel.findById(id).select("-password");

  if (!dentist) {
    return res.json({ success: false, message: "Stomatolog topilmadi" });
  }

  res.json({ success: true, dentist });
};

export const pendingTreatments = async (req, res) => {
  try {
    const treatments = await treatmentModel
      .find({
        paymentStatus: { $in: ["UNPAID", "PARTIAL"] },
        $nor: [
          {
            requestedPaidNowAt: { $ne: null },
            requestedPaidNow: { $gt: 0 },
          },
        ],
      })
      .populate("userId", "name phone")
      .populate("dentistId", "name")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ createdAt: -1 });

    const list = treatments.map((t) => {
      const obj = t.toObject();
      const amount = Math.max(0, Number(obj.amount || 0));
      const paid = Math.max(0, Number(obj.paidAmount || 0));
      const debt = Math.max(0, amount - paid);

      const payments = Array.isArray(obj.payments) ? obj.payments : [];
      const lastPaidAt =
        obj.lastPaidAt ||
        (payments.length ? payments[payments.length - 1]?.paidAt : null);

      return { ...obj, debt, lastPaidAt };
    });

    return res.json({ success: true, treatments: list });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const paymentRequests = async (req, res) => {
  try {
    const treatments = await treatmentModel
      .find({
        requestedPaidNowAt: { $ne: null },
        requestedPaidNow: { $gt: 0 },
      })
      .populate("userId", "name phone")
      .populate("dentistId", "name")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ requestedPaidNowAt: -1 });

    const list = treatments.map((t) => {
      const obj = t.toObject();
      const debt = Math.max(
        0,
        Number(obj.amount || 0) - Number(obj.paidAmount || 0),
      );
      return { ...obj, debt };
    });

    return res.json({ success: true, treatments: list });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const confirmTreatmentPayment = async (req, res) => {
  try {
    const { id } = req.params;
    let t = null;
    if (mongoose.isValidObjectId(id)) {
      t = await treatmentModel.findById(id);
      if (!t) {
        t = await treatmentModel.findOne({ appointmentId: id });
      }
    }
    if (!t) return res.json({ success: false, message: "Davolash topilmadi" });

    const rawPaidNow = req.body?.paidNow;
    const extra =
      rawPaidNow === undefined || rawPaidNow === null || rawPaidNow === ""
        ? Number(t.requestedPaidNow || 0)
        : Number(rawPaidNow || 0);

    if (!Number.isFinite(extra) || extra < 0) {
      return res.json({ success: false, message: "To'lov noto'g'ri" });
    }

    const amount = Math.max(0, Number(t.amount || 0));
    const paid = Math.max(0, Number(t.paidAmount || 0));
    const debt = Math.max(0, amount - paid);

    if (debt <= 0 && extra === 0) {
      t.paidAmount = Number(t.amount || 0);
      t.paymentStatus = "PAID";
      t.lastPaidAt = new Date();

      t.requestedPaidNow = 0;
      t.requestedPaidNowAt = null;

      await t.save();

    const app = await appointmentModel.findById(t.appointmentId);
    if (app) {
      syncAppointmentFinancialFromTreatment(app, t);
      await app.save();
    }

      return res.json({
        success: true,
        message: "To‘lovsiz yakunlandi",
        added: 0,
        paymentStatus: "PAID",
        paidAmount: t.amount,
        debt: 0,
        lastPaidAt: t.lastPaidAt,
      });
    }

    const paidAt = new Date();
    const method = "CASH";
    const note = req.body?.note ? String(req.body.note) : "";

   const { added, paymentRef } = applyPaymentToTreatment(t, extra, {
     paidAt,
     method,
     source: "ADMIN_CONFIRM",
     note,
   });

    if (added <= 0) {
      return res.json({ success: false, message: "To'lov qo'shilmadi" });
    }

    t.requestedPaidNow = 0;
    t.requestedPaidNowAt = null;

    await t.save();

   const app = await appointmentModel.findById(t.appointmentId);
   if (app) {
     syncAppointmentFinancialFromTreatment(app, t);
     await app.save();
   }

    await enqueuePostPaymentTelegramEvents({
      treatmentId: t._id,
      paymentRef,
    });

    // Notify dentist about payment confirmation
    try {
      const patient = await userModel.findById(t.userId).select("name").lean();
      const currentDebt = Math.max(0, Number(t.amount || 0) - Number(t.paidAmount || 0));
      const { notifyDentistAboutPayment } = await import("../utils/telegramBot.js");
      await notifyDentistAboutPayment({
        dentistId: t.dentistId,
        patientName: patient?.name || "Bemor",
        amount: added,
        debt: currentDebt,
        note: note || "",
      });
    } catch (telegramErr) {
      console.warn("[confirmTreatmentPayment] Dentist Telegram notify failed:", telegramErr.message);
    }

    return res.json({
      success: true,
      message:
        t.paymentStatus === "PAID"
          ? "To'lov to'liq tasdiqlandi"
          : "Qisman to'lov tasdiqlandi",
      added,
      paymentStatus: t.paymentStatus,
      paidAmount: t.paidAmount,
      debt: Math.max(0, Number(t.amount || 0) - Number(t.paidAmount || 0)),
      lastPaidAt: t.lastPaidAt,
    });
  } catch (error) {
    console.error("confirmTreatmentPayment error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const adminChangeTreatmentAmount = async (req, res) => {
  try {
    const { id } = req.params;

    const adminPassword = String(req.body?.adminPassword || "");
    const dentistPassword = String(req.body?.dentistPassword || "");
    const reason = String(req.body?.reason || "").trim();
    const newAmount = Math.max(0, Number(req.body?.newAmount || 0));

    if (!id) {
      return res.json({ success: false, message: "Davolash ID kerak" });
    }

    if (!adminPassword) {
      return res.json({
        success: false,
        message: "Admin parolini kiriting",
      });
    }

    if (!dentistPassword) {
      return res.json({
        success: false,
        message: "Stomatolog parolini kiriting",
      });
    }

    if (!Number.isFinite(newAmount) || newAmount < 0) {
      return res.json({
        success: false,
        message: "Yangi summa noto‘g‘ri",
      });
    }

    if (!reason) {
      return res.json({
        success: false,
        message: "Sababni kiriting",
      });
    }

    if (!verifyAdminSensitivePassword(adminPassword)) {
      return res.json({
        success: false,
        message: "Admin paroli noto‘g‘ri",
      });
    }

    let treatment = null;
    if (mongoose.isValidObjectId(id)) {
      treatment = await treatmentModel.findById(id);
      if (!treatment) {
        treatment = await treatmentModel.findOne({ appointmentId: id });
      }
    }
    if (!treatment) {
      return res.json({ success: false, message: "Davolash topilmadi" });
    }

    const okDentist = await verifyDentistSensitivePassword(
      treatment.dentistId,
      dentistPassword,
    );

    if (!okDentist) {
      return res.json({
        success: false,
        message: "Stomatolog paroli noto‘g‘ri",
      });
    }

    const oldAmount = Math.max(0, Number(treatment.amount || 0));
    const paidAmount = Math.max(0, Number(treatment.paidAmount || 0));

    if (newAmount === oldAmount) {
      return res.json({
        success: false,
        message: "Yangi summa avvalgi summa bilan bir xil",
      });
    }

    if (newAmount < paidAmount) {
      treatment.paidAmount = newAmount;
      if (Array.isArray(treatment.payments)) {
        treatment.payments.forEach((p) => {
          if (p.amount > newAmount) {
            p.amount = newAmount;
          }
        });
      }
    }

    const dentist = await dentistModel.findById(treatment.dentistId).select("name").lean();

    treatment.amount = newAmount;
    treatment.paymentStatus = paymentStatusFrom(
      treatment.amount,
      treatment.paidAmount,
    );

    const debt = Math.max(
      0,
      Number(treatment.amount || 0) - Number(treatment.paidAmount || 0),
    );

    if (Number(treatment.requestedPaidNow || 0) > debt) {
      treatment.requestedPaidNow = debt;
      treatment.requestedPaidNowAt = debt > 0 ? new Date() : null;
    }

    pushAmountHistory(treatment, {
      action: "ADMIN_CHANGE_WITH_DENTIST_CONFIRM",
      oldAmount,
      newAmount,
      reason,
      changedAt: new Date(),
      changedByRole: "ADMIN",
      changedById: "admin",
      changedByName: "Admin",
      confirmedDentistId: String(treatment.dentistId || ""),
      confirmedDentistName: dentist?.name || "",
    });

    await treatment.save();

    const appointment = await appointmentModel.findById(treatment.appointmentId);
    if (appointment) {
      syncAppointmentFinancialFromTreatment(appointment, treatment);
      await appointment.save();
    }

    return res.json({
      success: true,
      message: "Qabul summasi muvaffaqiyatli yangilandi",
      treatment: {
        _id: treatment._id,
        amount: treatment.amount,
        paidAmount: treatment.paidAmount,
        paymentStatus: treatment.paymentStatus,
        requestedPaidNow: treatment.requestedPaidNow,
        requestedPaidNowAt: treatment.requestedPaidNowAt,
        amountHistory: Array.isArray(treatment.amountHistory)
          ? treatment.amountHistory
          : [],
      },
    });
  } catch (error) {
    console.error("adminChangeTreatmentAmount error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const { range = "all", from, to, dentistId } = req.query;

    const startOfDay = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const now = new Date();
    let start = null;
    let end = null;
    let rangeLabel = "Barcha vaqt";

    switch (range) {
      case "today": {
        start = startOfDay(now);
        end = endOfDay(now);
        rangeLabel = "Bugun";
        break;
      }
      case "3d": {
        const s = new Date(now);
        s.setDate(s.getDate() - 2);
        start = startOfDay(s);
        end = endOfDay(now);
        rangeLabel = "So‘nggi 3 kun";
        break;
      }
      case "week": {
        const s = new Date(now);
        s.setDate(s.getDate() - 6);
        start = startOfDay(s);
        end = endOfDay(now);
        rangeLabel = "So‘nggi 7 kun";
        break;
      }
      case "month": {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        rangeLabel = "Joriy oy";
        break;
      }
      case "season": {
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        const quarterEndMonth = q * 3 + 2;
        end = endOfDay(new Date(now.getFullYear(), quarterEndMonth + 1, 0));
        rangeLabel = "Joriy chorak";
        break;
      }
      case "year": {
        start = new Date(now.getFullYear(), 0, 1);
        end = endOfDay(now);
        rangeLabel = "Joriy yil";
        break;
      }
      case "custom": {
        const s = from ? new Date(from) : null;
        const e = to ? new Date(to) : null;
        if (s && !isNaN(s.getTime())) start = startOfDay(s);
        if (e && !isNaN(e.getTime())) end = endOfDay(e);
        rangeLabel = "Tanlangan oraliq";
        break;
      }
      default:
        break;
    }

    const ymdString = (d) => {
      const x = new Date(d);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const day = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const hasRange = start && end;

    let dentistObjectId = null;
    if (dentistId && mongoose.Types.ObjectId.isValid(dentistId)) {
      dentistObjectId = new mongoose.Types.ObjectId(dentistId);
    }

    const [totalDentists, totalPatients] = await Promise.all([
      dentistModel.countDocuments(),
      userModel.countDocuments(),
    ]);

    const tMatch = {};
    if (hasRange) tMatch.createdAt = { $gte: start, $lte: end };
    if (dentistObjectId) {
      tMatch.dentistId = { $in: [dentistObjectId, String(dentistId)] };
    }

    const tAgg = await treatmentModel.aggregate([
      { $match: tMatch },
      {
        $group: {
          _id: null,
          visitsCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          patientsSet: { $addToSet: { $ifNull: ["$patientId", "$userId"] } },
        },
      },
      {
        $project: {
          _id: 0,
          visitsCount: 1,
          totalAmount: 1,
          totalPaid: 1,
          patientsCount: { $size: "$patientsSet" },
        },
      },
    ]);

    const totalVisits = tAgg[0]?.visitsCount || 0;
    const totalAmount = tAgg[0]?.totalAmount || 0;
    const totalPaid = tAgg[0]?.totalPaid || 0;
    const totalDebt = Math.max(0, totalAmount - totalPaid);
    const patientsCount = tAgg[0]?.patientsCount || 0;

    const appMatch = {};
    if (hasRange) {
      appMatch.slotDate = { $gte: ymdString(start), $lte: ymdString(end) };
    }
    if (dentistObjectId) {
      appMatch.dentistID = { $in: [dentistObjectId, String(dentistId)] };
    }

    const appAgg = await appointmentModel.aggregate([
      { $match: appMatch },
      { $group: { _id: null, totalAppointments: { $sum: 1 } } },
      { $project: { _id: 0, totalAppointments: 1 } },
    ]);

    const totalAppointments = appAgg[0]?.totalAppointments || 0;

    const perDentistTreatments = await treatmentModel.aggregate([
      { $match: tMatch },
      {
        $group: {
          _id: "$dentistId",
          visits: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          patientsSet: { $addToSet: { $ifNull: ["$patientId", "$userId"] } },
        },
      },
      {
        $project: {
          visits: 1,
          totalAmount: 1,
          totalPaid: 1,
          patientsCount: { $size: "$patientsSet" },
        },
      },
    ]);

    const perDentistApps = await appointmentModel.aggregate([
      { $match: appMatch },
      { $group: { _id: "$dentistID", totalAppointments: { $sum: 1 } } },
      { $project: { totalAppointments: 1 } },
    ]);

    const dentistIds = Array.from(
      new Set([
        ...perDentistTreatments.map((d) => String(d._id)),
        ...perDentistApps.map((d) => String(d._id)),
      ]),
    ).filter(Boolean);

    const dentists = dentistIds.length
      ? await dentistModel
          .find({ _id: { $in: dentistIds } })
          .select("name")
          .lean()
      : [];

    const dentistNameMap = new Map(
      dentists.map((d) => [String(d._id), d.name]),
    );
    const tMap = new Map(perDentistTreatments.map((d) => [String(d._id), d]));
    const aMap = new Map(perDentistApps.map((d) => [String(d._id), d]));

    const byDentist = dentistIds
      .map((id) => {
        const t = tMap.get(id) || {};
        const a = aMap.get(id) || {};

        const amount = Number(t.totalAmount || 0);
        const paid = Number(t.totalPaid || 0);
        const debt = Math.max(0, amount - paid);
        const payRate = amount > 0 ? Math.round((paid / amount) * 100) : 100;

        return {
          dentistId: id,
          name: dentistNameMap.get(id) || "Noma’lum stomatolog",
          visits: Number(t.visits || 0),
          patientsCount: Number(t.patientsCount || 0),
          appointments: Number(a.totalAppointments || 0),
          totalAmount: amount,
          totalPaid: paid,
          totalDebt: debt,
          payRate,
        };
      })
      .sort((x, y) => (y.totalPaid || 0) - (x.totalPaid || 0));

    const payRateAll =
      totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 100;

    return res.json({
      success: true,
      stats: {
        totalDentists,
        totalPatients,

        range: {
          key: range,
          label: rangeLabel,
          from: hasRange ? start : null,
          to: hasRange ? end : null,
        },
        totalAppointments,
        totalVisits,
        patientsCount,
        totalAmount,
        totalPaid,
        totalDebt,
        payRateAll,
        byDentist,
      },
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const t = await treatmentModel
      .findById(id)
      .populate("userId", "name phone address")
      .populate("dentistId", "name")
      .populate("appointmentId", "slotDate slotTime");

    if (!t) return res.json({ success: false, message: "Davolash topilmadi" });

    const debt = Math.max(0, Number(t.amount || 0) - Number(t.paidAmount || 0));

    return res.json({
      success: true,
      invoice: {
        id: t._id,
        user: t.userId,
        dentist: t.dentistId,
        appointment: t.appointmentId,
        amount: t.amount,
        paidAmount: t.paidAmount,
        debt,
        paymentStatus: t.paymentStatus,
        payments: Array.isArray(t.payments) ? t.payments : [],
        lastPaidAt: t.lastPaidAt || null,
        createdAt: t.createdAt,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const notifyPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, message } = req.body;

    const t = await treatmentModel
      .findById(id)
      .populate("userId", "name phone");
    if (!t) return res.json({ success: false, message: "Davolash topilmadi" });

    console.log(
      `[FAKE SEND] channel=${channel} phone=${t.userId.phone} msg=${message}`,
    );

    return res.json({
      success: true,
      message: "Xabar yuborildi (demo). Real SMS API kerak.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const debtReportByPatient = async (req, res) => {
  try {
    const sums = await treatmentModel.aggregate([
      {
        $project: {
          userId: 1,
          debt: { $subtract: ["$amount", "$paidAmount"] },
        },
      },
      { $match: { debt: { $gt: 0 } } },
      {
        $group: {
          _id: "$userId",
          totalDebt: { $sum: "$debt" },
        },
      },
      { $sort: { totalDebt: -1 } },
    ]);

    const userIds = sums.map((x) => x._id);
    const users = await userModel
      .find({ _id: { $in: userIds } })
      .select("name phone");
    const map = new Map(users.map((u) => [String(u._id), u]));

    const report = sums.map((x) => ({
      userId: x._id,
      name: map.get(String(x._id))?.name || "",
      phone: map.get(String(x._id))?.phone || "",
      totalDebt: x.totalDebt || 0,
    }));

    return res.json({ success: true, report });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};

export const adminPatientsList = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const debtAgg = await treatmentModel.aggregate([
      {
        $project: {
          userId: 1,
          debt: { $subtract: ["$amount", "$paidAmount"] },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalDebt: {
            $sum: {
              $cond: [{ $gt: ["$debt", 0] }, "$debt", 0],
            },
          },
        },
      },
    ]);

    const debtMap = new Map(
      debtAgg.map((x) => [String(x._id), Number(x.totalDebt || 0)]),
    );

    const lastVisitAgg = await appointmentModel.aggregate([
      { $match: { cancelled: { $ne: true } } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$userId",
          lastDate: { $first: "$date" },
          lastSlotDate: { $first: "$slotDate" },
          lastSlotTime: { $first: "$slotTime" },
        },
      },
    ]);

    const lastVisitMap = new Map(
      lastVisitAgg.map((x) => [
        String(x._id),
        {
          lastDate: x.lastDate || null,
          lastSlotDate: x.lastSlotDate || "",
          lastSlotTime: x.lastSlotTime || "",
        },
      ]),
    );

    const list = users.map((u) => {
      const uid = String(u._id);
      const lv = lastVisitMap.get(uid) || {};
      return {
        ...u,
        totalDebt: debtMap.get(uid) || 0,
        lastVisit: lv.lastSlotDate
          ? `${lv.lastSlotDate} ${lv.lastSlotTime || ""}`.trim()
          : "",
        lastVisitTs: lv.lastDate || null,
      };
    });

    return res.json({ success: true, patients: list });
  } catch (e) {
    console.error("adminPatientsList error:", e);
    return res.json({ success: false, message: e.message });
  }
};

export const adminPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await userModel
      .findById(id)
      .select("-password +infectiousDiseaseMarkers")
      .lean();
    if (!patient) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    const apps = await appointmentModel
      .find({ userId: id })
      .populate("dentistID", "name image dentistId phone degree speciality")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    if (!apps.length) {
      return res.json({
        success: true,
        patient,
        totals: { totalAmount: 0, totalPaid: 0, totalDebt: 0 },
        stats: { orthoVisitCount: 0 },
        history: [],
      });
    }

    const appointmentIds = apps.map((a) => a._id);

    const [treatments, orthodontistQueueEntries] = await Promise.all([
      treatmentModel
        .find({ appointmentId: { $in: appointmentIds } })
        .select(
  "appointmentId dentistId diagnosis teeth procedures nextStep medicines notes sourceTemplateId sourceTemplateTitle nextVisitDate nextVisitTime amount paidAmount paymentStatus payments amountHistory lastPaidAt xrays createdAt",
)
        .lean(),

      orthodontistQueueModel
        .find({
          patientId: id,
          appointmentId: { $in: appointmentIds },
        })
        .select(
          "appointmentId dentistId queueNo status source firstVisit visitPurpose visitPurposeLabel joinedAt arrivedAt calledAt doneAt missedAt cancelledAt followUpDays followUpSelectedAt nextPlannedDate progressImages createdAt updatedAt",
        )
        .sort({ doneAt: -1, createdAt: -1 })
        .lean(),
    ]);

    const treatmentByAppointment = new Map();

    for (const t of treatments) {
      const amount = Math.max(0, Number(t.amount || 0));
      const paidAmount = Math.max(0, Number(t.paidAmount || 0));
      const debt = Math.max(0, amount - paidAmount);
      const payments = Array.isArray(t.payments) ? t.payments : [];
      const lastPaidAt =
        t.lastPaidAt ||
        (payments.length ? payments[payments.length - 1]?.paidAt : null);

      treatmentByAppointment.set(String(t.appointmentId), {
  ...t,
  amount,
  paidAmount,
  debt,
  paymentStatus: t.paymentStatus || paymentStatusFrom(amount, paidAmount),
  payments,
  amountHistory: Array.isArray(t.amountHistory) ? t.amountHistory : [],
  lastPaidAt,
  xrays: Array.isArray(t.xrays) ? t.xrays : [],
});
    }

    const orthoByAppointment = new Map();

    for (const row of orthodontistQueueEntries) {
      const key = String(row.appointmentId || "");
      if (key && !orthoByAppointment.has(key)) {
        orthoByAppointment.set(key, row);
      }
    }

    const history = apps.map((a) => {
      const dentistData = a.dentistID
        ? {
            _id: a.dentistID._id,
            name: a.dentistID.name,
            image: a.dentistID.image,
            dentistId: a.dentistID.dentistId,
            phone: a.dentistID.phone || "",
            degree: a.dentistID.degree || "",
            speciality: Array.isArray(a.dentistID.speciality)
              ? a.dentistID.speciality
              : [],
          }
        : null;

      const appointment = {
        ...a,
        isCancelled: Boolean(
          a.isCancelled || a.cancelled || a.status === "CANCELLED",
        ),
        cancelled: Boolean(a.cancelled || a.status === "CANCELLED"),
        userId: patient._id,
        userData: {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone,
          image: patient.image || "",
        },
        dentistId: dentistData?._id || a.dentistID || null,
        dentistData,
      };

      return {
        appointment,
        dentistData,
        treatment: treatmentByAppointment.get(String(a._id)) || null,
        orthodontistQueue: orthoByAppointment.get(String(a._id)) || null,
      };
    });

    const totals = history.reduce(
      (acc, row) => {
        acc.totalAmount += Number(row?.treatment?.amount || 0);
        acc.totalPaid += Number(row?.treatment?.paidAmount || 0);
        return acc;
      },
      { totalAmount: 0, totalPaid: 0 },
    );

    totals.totalDebt = Math.max(0, totals.totalAmount - totals.totalPaid);

    const isGenuineOrthoControl = (row) => {
      const o = row?.orthodontistQueue;
      if (!o) return false;
      return Boolean(
        o.isOrthoControl === true ||
        o.visitPurpose === "ORTHO_CONTROL" ||
        o.visitPurpose === "REGULAR_CONTROL" ||
        (o.followUpDays && Number(o.followUpDays) > 0) ||
        /ortodont/i.test(String(o.visitPurposeLabel || ""))
      );
    };

    const orthoVisitCount = history.reduce(
      (sum, row) => sum + (isGenuineOrthoControl(row) ? 1 : 0),
      0,
    );

    return res.json({
      success: true,
      patient,
      totals,
      stats: { orthoVisitCount },
      history,
    });
  } catch (e) {
    console.error("adminPatientDetails error:", e);
    return res.json({ success: false, message: e.message });
  }
};

export const adminCreatePatient = async (req, res) => {
  try {
    let {
      name,
      phone,
      email,
      DOB,
      gender,
      address,
      infectiousDiseaseMarkers,
      allergy = "",
      medicalWarnings = "",
      note = "",
    } = req.body;

    if (!name || !phone || !DOB) {
      return res.json({
        success: false,
        message: "Ism, telefon va tug‘ilgan sana majburiy",
      });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.json({ success: false, message: "Telefon noto‘g‘ri" });
    }

    const emailNormalized = userModel.normalizeOptionalEmail(email);

    if (emailNormalized && !validator.isEmail(emailNormalized)) {
      return res.json({ success: false, message: "Email noto‘g‘ri" });
    }

    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        address = {};
      }
    }
    const duplicateBySharedContactAndDob =
      await findDuplicateBySharedContactAndDob({
        phone: normalizedPhone,
        email: emailNormalized,
        DOB,
      });

    if (duplicateBySharedContactAndDob) {
      return res.json({
        success: false,
        message: `Shu telefon yoki email va tug‘ilgan sana bilan bemor allaqachon mavjud${duplicateBySharedContactAndDob?.patientId ? ` (${duplicateBySharedContactAndDob.patientId})` : ""}`,
      });
    }

    const capacity = await userModel.checkSharedContactCapacity({
      phone: normalizedPhone,
      email: emailNormalized,
    });

    if (!capacity.ok) {
      return res.json({ success: false, message: capacity.message });
    }

    const normalizedGender =
      gender && ["Erkak", "Ayol", "Tanlanmagan"].includes(gender)
        ? gender
        : "Tanlanmagan";

    const preparedPatientImage = req.file?.buffer
      ? await prepareImageForJpegStorage(req.file.buffer, {
          originalName: req.file.originalname,
        })
      : null;

    const patient = await userModel.create({
      name: String(name).trim(),
      phone: normalizedPhone,
      email: emailNormalized || undefined,
      password: "",
      address: address || { line1: "", line2: "" },
      DOB: String(DOB),
      gender: normalizedGender,
      needsPasswordSet: true,
      isActivated: false,
      infectiousDiseaseMarkers: normalizeInfectiousDiseaseMarkers(
        infectiousDiseaseMarkers,
      ),
      allergy: String(allergy || "").trim(),
      medicalWarnings: String(medicalWarnings || "").trim(),
      note: String(note || "").trim(),
    });

    if (req.file && req.file.buffer) {
      const fileName = buildPatientImageFileName({
        patientId: patient.patientId || String(patient._id),
        patientName: patient.name,
        ext: ".jpg",
      });

      const targetDir = path.join(
        process.cwd(),
        "uploads",
        "public",
        "patients",
      );
      ensureDir(targetDir);

      const absPath = path.join(targetDir, fileName);
      await writePreparedImageToFile(preparedPatientImage, absPath);

      patient.image = `/uploads/patients/${fileName}`;
      await patient.save();
    }

    return res.json({
      success: true,
      message:
        "Bemor yaratildi. Bemor keyinchalik ism, telefon raqam va tug‘ilgan sana orqali akkauntni faollashtiradi.",
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        DOB: patient.DOB,
        image: patient.image,
      },
    });
  } catch (e) {
    console.error("adminCreatePatient error:", e);
    return res.json({ success: false, message: e.message });
  }
};


export const adminUpdatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    const patient = await userModel.findById(id).select("patientId image name phone email DOB gender address allergy medicalWarnings note");
    if (!patient) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    let {
      name,
      phone,
      email,
      DOB,
      gender,
      address,
      allergy = "",
      medicalWarnings = "",
      note = "",
    } = req.body || {};

    const update = {};

    if (name !== undefined) {
      const normalizedName = String(name || "").trim();
      if (!normalizedName) {
        return res.json({ success: false, message: "Ism majburiy" });
      }
      update.name = normalizedName;
    }

    let normalizedPhone = "";
    if (phone !== undefined) {
      normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return res.json({ success: false, message: "Telefon noto‘g‘ri" });
      }
      update.phone = normalizedPhone;
    } else {
      normalizedPhone = patient.phone;
    }

    let emailNormalized = patient.email || "";
    if (email !== undefined) {
      emailNormalized = userModel.normalizeOptionalEmail(email);
      if (emailNormalized && !validator.isEmail(emailNormalized)) {
        return res.json({ success: false, message: "Email noto‘g‘ri" });
      }
      update.email = emailNormalized || undefined;
    }

    let normalizedDob = patient.DOB || "";
    if (DOB !== undefined) {
      normalizedDob = userModel.normalizeDateOnly(DOB);
      if (!normalizedDob) {
        return res.json({ success: false, message: "Tug‘ilgan sana majburiy" });
      }
      update.DOB = String(DOB);
    }

    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        address = { line1: String(address || "").trim(), line2: "" };
      }
    }
    if (address !== undefined) {
      update.address = address || { line1: "", line2: "" };
    }

    if (gender !== undefined) {
      update.gender = ["Erkak", "Ayol", "Tanlanmagan"].includes(gender)
        ? gender
        : "Tanlanmagan";
    }

    if (allergy !== undefined) {
      update.allergy = String(allergy || "").trim();
    }
    if (medicalWarnings !== undefined) {
      update.medicalWarnings = String(medicalWarnings || "").trim();
    }
    if (note !== undefined) {
      update.note = String(note || "").trim();
    }

    const duplicateBySharedContactAndDob =
      await findDuplicateBySharedContactAndDob({
        phone: normalizedPhone,
        email: emailNormalized,
        DOB: normalizedDob,
        excludeUserId: patient._id,
      });

    if (duplicateBySharedContactAndDob) {
      return res.json({
        success: false,
        message: `Shu telefon yoki email va tug‘ilgan sana bilan bemor allaqachon mavjud${duplicateBySharedContactAndDob?.patientId ? ` (${duplicateBySharedContactAndDob.patientId})` : ""}`,
      });
    }

    const capacity = await userModel.checkSharedContactCapacity({
      phone: normalizedPhone,
      email: emailNormalized,
      excludeUserId: patient._id,
    });

    if (!capacity.ok) {
      return res.json({ success: false, message: capacity.message });
    }

    const updated = await userModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select("-password +infectiousDiseaseMarkers")
      .lean();

    return res.json({
      success: true,
      message: "Bemor ma’lumotlari yangilandi",
      patient: updated,
    });
  } catch (error) {
    console.error("adminUpdatePatient error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const adminUpdatePatientInfectiousDiseaseMarkers = async (req, res) => {
  try {
    const { id } = req.params;
    const password = req.body?.password;

    if (!verifyAdminSensitivePassword(password)) {
      return res.json({ success: false, message: "Parol noto‘g‘ri" });
    }

    const markers = normalizeInfectiousDiseaseMarkers(
      req.body?.infectiousDiseaseMarkers ?? req.body?.markers,
    );

    const patient = await userModel
      .findByIdAndUpdate(
        id,
        { infectiousDiseaseMarkers: markers },
        { new: true, runValidators: true },
      )
      .select("patientId name +infectiousDiseaseMarkers")
      .lean();

    if (!patient) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    return res.json({
      success: true,
      message: "Infeksion belgilar yangilandi",
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        infectiousDiseaseMarkers: patient.infectiousDiseaseMarkers || [],
      },
    });
  } catch (error) {
    console.error("adminUpdatePatientInfectiousDiseaseMarkers error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const adminVerifyPatientInfectiousDiseaseAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const password = req.body?.password;

    if (!id) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    if (!verifyAdminSensitivePassword(password)) {
      return res.json({ success: false, message: "Parol noto‘g‘ri" });
    }

    const exists = await userModel.exists({ _id: id });
    if (!exists) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    return res.json({ success: true, message: "Ruxsat berildi" });
  } catch (error) {
    console.error("adminVerifyPatientInfectiousDiseaseAccess error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const adminConfirmArrival = async (req, res) => {
  try {
    const { appointmentId } = req.body || {};

    if (!appointmentId) {
      return res.json({
        success: false,
        message: "appointmentId kerak",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({
        success: false,
        message: "Uchrashuv topilmadi",
      });
    }

    if (appointment.cancelled || appointment.status === "CANCELLED") {
      return res.json({
        success: false,
        message: "Bekor qilingan uchrashuv uchun tasdiqlab bo‘lmaydi",
      });
    }

    if (!appointment.slotDate || !appointment.slotTime) {
      return res.json({
        success: false,
        message: "Slot maʼlumotlari topilmadi",
      });
    }

    const now = new Date();
    const { slotDate, slotTime } = buildNowSlot();
    const ts = now.getTime();

    await releaseLocksByAppointment(appointment._id);

    appointment.slotDate = slotDate;
    appointment.slotTime = slotTime;
    appointment.date = ts;

    // Admin only confirms arrival and moves patient to today's queue.
    // Real treatment starts only when dentist clicks "Ishni boshladim".
    appointment.startedAt = null;
    appointment.status = "WAITING";

    await appointment.save();

    // Notify dentist about patient's arrival
    try {
      const patient = await userModel.findById(appointment.userId).select("name").lean();
      const { notifyDentistAboutPatientArrival } = await import("../utils/telegramBot.js");
      await notifyDentistAboutPatientArrival({
        dentistId: appointment.dentistID,
        patientName: patient?.name || "Bemor",
        queueNo: "",
        isWalkIn: appointment.isWalkIn,
        slotTime: appointment.slotTime,
        note: appointment.walkInNote || "",
      });
    } catch (err) {
      console.warn("[adminConfirmArrival] Dentist Telegram notify failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Bemor kelishi bugunga ko‘chirildi",
      appointmentId: appointment._id,
    });
  } catch (error) {
    console.error("adminConfirmArrival error:", error);
    return res.json({
      success: false,
      message: error.message || "Xatolik",
    });
  }
};

export const adminCalendarAvailability = async (req, res) => {
  try {
    const dentistID = req.query?.dentistId || req.query?.dentistID;
    const fromDate = req.query?.fromDate;
    const days = Math.min(Math.max(Number(req.query?.days || 7), 1), 14);
    console.log("[BACKEND-LOG] adminCalendarAvailability: dentistID =", dentistID, "fromDate =", fromDate, "days =", days);

    if (!dentistID) {
      return res.json({ success: false, message: "Stomatolog ID majburiy" });
    }
    
    const { getDetailedScheduleForDentist } = await import("../utils/schedule.js");
    
    const data = await getDetailedScheduleForDentist({
      dentistID,
      startDate: fromDate,
      days,
    });

    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("adminCalendarAvailability error:", error);
    return res.json({
      success: false,
      message: error.message || "Kalendar yuklanmadi",
    });
  }
};

export const adminCreateManualAppointment = async (req, res) => {
  try {
    const { dentistId, dentistID, doctorId, doctorID, userId, patientId, phone, name, slotDate, slotTime, note } = req.body || {};
    const finalDentistID = dentistId || dentistID || doctorId || doctorID;

    if (!finalDentistID) {
      return res.json({ success: false, message: "Stomatolog ID majburiy" });
    }

    if (!slotDate || !slotTime) {
      return res.json({ success: false, message: "Sana va vaqt majburiy" });
    }

    let patient;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      patient = await userModel.findById(userId);
    } else if (patientId) {
      patient = await userModel.findOne({ patientId: patientId.trim().toUpperCase() });
    } else if (phone) {
      const normPhone = normalizePhone(phone);
      const matches = await userModel.find({ phone: normPhone });
      if (matches.length === 1) {
        patient = matches[0];
      } else if (matches.length > 1) {
        const byName = matches.find(p => p.name?.toLowerCase().trim() === name?.toLowerCase().trim());
        if (byName) {
          patient = byName;
        } else {
          return res.json({
            success: false,
            message: "Bu telefon raqam bilan bir nechta bemor mavjud. Bemor ID orqali tanlang."
          });
        }
      }
    }

    if (!patient) {
      if (!name || name.trim().length < 2) {
        return res.json({ success: false, message: "Yangi bemor ismi kamida 2 ta harfdan iborat bo'lishi kerak" });
      }
      const normPhone = normalizePhone(phone);
      if (!normPhone) {
        return res.json({ success: false, message: "Yangi bemor telefon raqami noto'g'ri" });
      }
      patient = await userModel.create({
        name: name.trim(),
        phone: normPhone,
        DOB: "",
        address: { line1: "", line2: "" }
      });
    }

    const dentistDoc = await dentistModel.findById(finalDentistID).select("name image").lean();
    if (!dentistDoc) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    const { createAppointmentSafe } = await import("../utils/schedule.js");

    const appointment = await createAppointmentSafe({
      userId: patient._id,
      dentistID: finalDentistID,
      slotDate,
      slotTime,
      userData: patient,
      dentistData: {
        _id: dentistDoc._id,
        name: dentistDoc.name,
        image: dentistDoc.image,
      },
      createdFrom: "ADMIN",
    });

    // Notify dentist via Telegram for ALL new scheduled bookings (today or future)
    try {
      const { notifyDentistAboutNewBooking } = await import("../utils/telegramBot.js");
      await notifyDentistAboutNewBooking({
        dentistId: finalDentistID,
        patientName: patient.name,
        slotDate,
        slotTime,
        note: note || "",
        createdFrom: "ADMIN",
      });
    } catch (err) {
      console.warn("[adminCreateManualAppointment] Dentist Telegram notify failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Qabul muvaffaqiyatli yaratildi",
      appointment,
    });
  } catch (error) {
    console.error("adminCreateManualAppointment error:", error);
    return res.json({
      success: false,
      message: error.message || "Qabul yaratishda xatolik yuz berdi"
    });
  }
};

export const adminCancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.json({ success: false, message: "Uchrashuv topilmadi" });
    }

    if (appointment.cancelled || appointment.status === "CANCELLED") {
      return res.json({ success: false, message: "Uchrashuv allaqachon bekor qilingan" });
    }

    appointment.cancelled = true;
    appointment.status = "CANCELLED";
    await appointment.save();

    await releaseLocksByAppointment(appointment._id);

    const dentist = await dentistModel.findById(appointment.dentistID);
    if (dentist?.slots_booked?.[appointment.slotDate]) {
      dentist.slots_booked[appointment.slotDate] = dentist.slots_booked[
        appointment.slotDate
      ].filter((t) => t !== appointment.slotTime);

      if (!dentist.slots_booked[appointment.slotDate].length) {
        delete dentist.slots_booked[appointment.slotDate];
      }
      dentist.markModified("slots_booked");
      await dentist.save();
    }

    return res.json({
      success: true,
      message: "Uchrashuv muvaffaqiyatli bekor qilindi",
    });
  } catch (error) {
    console.error("adminCancelAppointment error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const adminRescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotDate, slotTime, dentistId, dentistID, reason } = req.body || {};
    const finalDentistID = dentistId || dentistID;

    const { rescheduleAppointmentSafe } = await import("../utils/schedule.js");
    const adminName = req.admin?.name || "Admin";

    const updatedAppointment = await rescheduleAppointmentSafe({
      appointmentId: id,
      newSlotDate: slotDate,
      newSlotTime: slotTime,
      newDentistID: finalDentistID,
      rescheduledBy: "ADMIN",
      rescheduledByName: adminName,
      reason: reason || "",
    });

    // Notify dentist via Telegram
    try {
      const { notifyDentistAboutReschedule } = await import("../utils/telegramBot.js");
      const historyList = updatedAppointment.rescheduleHistory || [];
      const history = historyList[historyList.length - 1];
      await notifyDentistAboutReschedule({
        dentistId: updatedAppointment.dentistID?._id || updatedAppointment.dentistID,
        patientName: updatedAppointment.userId?.name || "Bemor",
        oldSlotDate: history?.oldSlotDate || "",
        oldSlotTime: history?.oldSlotTime || "",
        newSlotDate: slotDate,
        newSlotTime: slotTime,
        rescheduledByName: adminName,
        rescheduledByRole: "ADMIN",
        reason: reason || "",
      });
    } catch (err) {
      console.warn("[adminRescheduleAppointment] Telegram notify failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Qabul vaqti muvaffaqiyatli ko'chirildi",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("adminRescheduleAppointment error:", error);
    return res.json({
      success: false,
      message: error.message || "Qabul vaqtini ko'chirishda xatolik yuz berdi",
    });
  }
};

export const getAdminPayrollReport = async (req, res) => {
  try {
    const { start, end } = req.query;

    const now = new Date();
    const periodStart = start
      ? new Date(`${start}T00:00:00.000Z`)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));

    const periodEnd = end
      ? new Date(`${end}T23:59:59.999Z`)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const dentists = await dentistModel
      .find({ isArchived: { $ne: true } })
      .select("name speciality commissionPercent")
      .lean();

    // Query all treatments that were either created in this period or received payments in this period
    const treatments = await treatmentModel
      .find({
        $or: [
          { createdAt: { $gte: periodStart, $lte: periodEnd } },
          { lastPaidAt: { $gte: periodStart, $lte: periodEnd } },
          { "payments.paidAt": { $gte: periodStart, $lte: periodEnd } },
        ],
      })
      .select(
        "dentistId amount paidAmount payments createdAt lastPaidAt commission",
      )
      .lean();

    const payouts = await commissionPayoutModel
      .find({
        payoutDate: { $gte: periodStart, $lte: periodEnd },
      })
      .lean();

    const report = dentists.map((doc) => {
      const docTreatments = treatments.filter(
        (t) => String(t.dentistId) === String(doc._id),
      );

      let totalPaid = 0;
      let totalCreatedAmount = 0;
      const commissionPercent = Number(doc.commissionPercent || 30);

      for (const t of docTreatments) {
        const createdInPeriod =
          new Date(t.createdAt) >= periodStart &&
          new Date(t.createdAt) <= periodEnd;
        if (createdInPeriod) {
          totalCreatedAmount += Number(t.amount || 0);
        }

        if (Array.isArray(t.payments) && t.payments.length > 0) {
          for (const p of t.payments) {
            const pDate = new Date(p.paidAt);
            if (pDate >= periodStart && pDate <= periodEnd) {
              totalPaid += Number(p.amount || 0);
            }
          }
        } else if (t.paidAmount > 0) {
          const pDate = new Date(t.lastPaidAt || t.createdAt);
          if (pDate >= periodStart && pDate <= periodEnd) {
            totalPaid += Number(t.paidAmount || 0);
          }
        }
      }

      // Stomatolog ulushi faqat reception / kassadagi REAL TUSHUM (totalPaid) asosida hisoblanadi!
      const totalCommission = Math.round((totalPaid * commissionPercent) / 100);

      const docPayouts = payouts.filter(
        (p) => String(p.dentistId) === String(doc._id),
      );
      const totalPaidPayouts = docPayouts.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );

      const unpaidCommission = Math.max(0, totalCommission - totalPaidPayouts);

      return {
        dentist: {
          _id: doc._id,
          name: doc.name,
          speciality: doc.speciality,
          commissionPercent,
        },
        totalTreatments: docTreatments.length,
        totalAmount: totalPaid, // Jami daromad = Real Tushum (kassadagi pul)
        totalCreatedAmount, // Yaratilgan jami muolajalar hajmi
        totalPaid, // Kassaga kelib tushgan real summa
        totalDebt: Math.max(0, totalCreatedAmount - totalPaid),
        totalCommission,
        paidCommission: totalPaidPayouts,
        unpaidCommission,
        totalPaidPayouts,
      };
    });

    res.json({ success: true, report, periodStart, periodEnd });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const payDentistCommission = async (req, res) => {
  try {
    const { dentistId, amount, periodStart, periodEnd, notes } = req.body;
    if (!dentistId || !amount) {
      return res.json({ success: false, message: "dentistId va summa kerak" });
    }

    const start = new Date(`${periodStart}T00:00:00.000Z`);
    const end = new Date(`${periodEnd}T23:59:59.999Z`);

    const payout = await commissionPayoutModel.create({
      dentistId,
      amount: Number(amount),
      periodStart: start,
      periodEnd: end,
      notes: notes || "",
      paidBy: "Admin"
    });

    // Automatically record dentist payout as a clinic expense (Oylik category)
    try {
      const dentist = await dentistModel.findById(dentistId).select("name").lean();
      const dentistName = dentist ? dentist.name : "Stomatolog";

      await expenseModel.create({
        title: `Stomatologga ish haqi to'lovi: ${dentistName}`,
        amount: Number(amount),
        category: "Oylik",
        date: new Date(),
        notes: notes || `Ish haqi davri: ${periodStart} - ${periodEnd}`
      });
    } catch (expenseErr) {
      console.error("[payDentistCommission] Auto expense logging failed:", expenseErr.message);
    }

    const result = await treatmentModel.updateMany(
      {
        dentistId,
        createdAt: { $gte: start, $lte: end },
        "commission.payoutStatus": { $ne: "PAID" }
      },
      {
        $set: {
          "commission.payoutStatus": "PAID",
          "commission.payoutId": payout._id
        }
      }
    );

    // Notify Dentist via Telegram about commission payout
    try {
      const { sendTelegramMessage, isTelegramConfigured } = await import("../utils/telegramBot.js");
      const { buildDoctorPayrollPaidMessage } = await import("../utils/telegramMessageBuilders.js");
      if (isTelegramConfigured()) {
        const doc = await dentistModel.findById(dentistId).select("telegram name").lean();
        if (doc?.telegram?.isVerified && doc?.telegram?.chatId) {
          const docLang = process.env.TELEGRAM_LANGUAGE || "uz";
          const payText = buildDoctorPayrollPaidMessage({
            amount: Number(amount),
            periodStart: start,
            periodEnd: end,
            notes: notes || "",
            language: docLang,
          });
          await sendTelegramMessage({
            chatId: doc.telegram.chatId,
            text: payText,
            parseMode: "HTML",
          }).catch(() => {});
        }
      }
    } catch (telegramErr) {
      console.warn("[payDentistCommission] Dentist Telegram notify failed:", telegramErr.message);
    }

    res.json({
      success: true,
      message: "Ish haqi muvaffaqiyatli to'landi",
      payout,
      updatedTreatmentsCount: result.modifiedCount
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAdminExpenses = async (req, res) => {
  try {
    const { start, end, category } = req.query;
    const filter = {};

    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await expenseModel.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, expenses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createAdminExpense = async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;
    if (!category || !amount) {
      return res.json({ success: false, message: "Kategoriya va summa majburiy" });
    }

    const expense = await expenseModel.create({
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      note: note || "",
      createdBy: "Admin"
    });

    res.json({ success: true, message: "Xarajat muvaffaqiyatli qo'shildi", expense });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteAdminExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Expense ID kerak" });
    }

    await expenseModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Xarajat o'chirildi" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminUpdateDentistCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionPercent } = req.body;

    const dentist = await dentistModel.findById(id);
    if (!dentist) {
      return res.json({ success: false, message: "Shifokor topilmadi" });
    }

    const pct = Number(commissionPercent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return res.json({ success: false, message: "Foiz miqdori 0 dan 100 gacha bo'lishi kerak" });
    }

    dentist.commissionPercent = pct;
    await dentist.save();

    await logActivity("EDIT_DENTIST", req, dentist._id, dentist.name, `${dentist.name} uchun ish haqi ulushi ${pct}% qilib o'zgartirildi.`);

    return res.json({ success: true, message: "Ish haqi ulushi o'zgartirildi", commissionPercent: pct });
  } catch (error) {
    console.error("adminUpdateDentistCommission error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const verifyAdminOrDentistPassword = async (req, res) => {
  try {
    const password = String(req.body?.password || "");
    if (!password) {
      return res.json({ success: false, message: "Parol kiritilmadi" });
    }

    const isAdmin = await verifyAdminSensitivePassword(password);
    if (isAdmin) {
      return res.json({ success: true, role: "admin" });
    }

    const dentists = await dentistModel.find({ isArchived: { $ne: true } }).select("password");
    for (const doc of dentists) {
      if (doc.password && (await bcrypt.compare(password, doc.password))) {
        return res.json({ success: true, role: "dentist", dentistId: doc._id });
      }
    }

    return res.json({ success: false, message: "Parol noto'g'ri" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyAdminAndDentistPassword = async (req, res) => {
  try {
    const { adminPassword, dentistId, dentistPassword } = req.body || {};

    if (!adminPassword || !dentistId || !dentistPassword) {
      return res.json({ success: false, message: "Barcha maydonlarni to'ldiring" });
    }

    const isAdmin = await verifyAdminSensitivePassword(String(adminPassword));
    if (!isAdmin) {
      return res.json({ success: false, message: "Administrator paroli noto'g'ri" });
    }

    const isDentist = await verifyDentistSensitivePassword(dentistId, String(dentistPassword));
    if (!isDentist) {
      return res.json({ success: false, message: "Shifokor paroli noto'g'ri" });
    }

    return res.json({ success: true, message: "Tasdiqlandi" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const { getTelegramBotUsername } = await import("../utils/telegramBot.js");
    const resolvedBotUsername = await getTelegramBotUsername();

    return res.json({
      success: true,
      settings: {
        clinicName: process.env.CLINIC_NAME || "Magic Denta",
        clinicAddress: process.env.CLINIC_ADDRESS || "",
        clinicMapUrl: process.env.CLINIC_MAP_URL || "",
        clinicWebsiteUrl: process.env.CLINIC_WEBSITE_URL || "",
        clinicLatitude: process.env.CLINIC_LATITUDE || "",
        clinicLongitude: process.env.CLINIC_LONGITUDE || "",
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
        telegramBotUsername: resolvedBotUsername || process.env.TELEGRAM_BOT_USERNAME || "",
        telegramQueueRadiusMeters: process.env.FOLLOW_UP_NEAR_METERS || "100",
        telegramOrthodontistQueueEnabled: process.env.TELEGRAM_ORTHODONTIST_QUEUE_ENABLED === "true",
        telegramLanguage: process.env.TELEGRAM_LANGUAGE || "uz",
      }
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateTelegramSettings = async (req, res) => {
  try {
    const {
      telegramBotToken,
      telegramBotUsername,
      clinicAddress,
      clinicMapUrl,
      clinicWebsiteUrl,
      clinicLatitude,
      clinicLongitude,
      telegramQueueRadiusMeters,
      telegramOrthodontistQueueEnabled,
      telegramLanguage,
    } = req.body;

    const updates = {};
    if (telegramBotToken !== undefined) {
      updates.TELEGRAM_BOT_TOKEN = String(telegramBotToken).trim();
    }
    if (telegramBotUsername !== undefined) {
      updates.TELEGRAM_BOT_USERNAME = String(telegramBotUsername).trim().replace(/^@/, "");
    }
    if (clinicAddress !== undefined) {
      updates.CLINIC_ADDRESS = String(clinicAddress).trim();
    }
    if (clinicMapUrl !== undefined) {
      updates.CLINIC_MAP_URL = String(clinicMapUrl).trim();
    }
    if (clinicWebsiteUrl !== undefined) {
      updates.CLINIC_WEBSITE_URL = String(clinicWebsiteUrl).trim();
    }
    if (clinicLatitude !== undefined) {
      updates.CLINIC_LATITUDE = String(clinicLatitude).trim();
    }
    if (clinicLongitude !== undefined) {
      updates.CLINIC_LONGITUDE = String(clinicLongitude).trim();
    }
    if (telegramQueueRadiusMeters !== undefined) {
      updates.FOLLOW_UP_NEAR_METERS = String(telegramQueueRadiusMeters).trim();
    }
    if (telegramOrthodontistQueueEnabled !== undefined) {
      updates.TELEGRAM_ORTHODONTIST_QUEUE_ENABLED = String(telegramOrthodontistQueueEnabled);
    }
    if (telegramLanguage !== undefined) {
      updates.TELEGRAM_LANGUAGE = String(telegramLanguage).trim().slice(0, 2).toLowerCase();
    }

    if (updates.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) {
      const { getTelegramBotUsername } = await import("../utils/telegramBot.js");
      const realUsername = await getTelegramBotUsername();
      if (realUsername) {
        updates.TELEGRAM_BOT_USERNAME = realUsername;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateEnvFile(updates);
      Object.assign(process.env, updates);
    }

    let webhookResult = null;
    if (updates.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) {
      const { registerTelegramWebhook } = await import("../utils/telegramBot.js");
      webhookResult = await registerTelegramWebhook(updates.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN);
    }

    res.json({
      success: true,
      botUsername: updates.TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME,
      message: webhookResult?.success
        ? "Telegram sozlamalari saqlandi va Webhook muvaffaqiyatli ulandi!"
        : "Telegram sozlamalari saqlandi!",
      webhookResult,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const validateSchedulePayload = (schedule) => {
  if (!Array.isArray(schedule)) {
    throw new Error("Jadval ro‘yxat shaklida bo‘lishi kerak");
  }
  if (schedule.length === 0) {
    return [];
  }
  
  const clean = [];
  const daysSeen = new Set();

  for (const item of schedule) {
    const day = Number(item.day);
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new Error("Kun raqami noto‘g‘ri (0-6 bo‘lishi kerak)");
    }
    if (daysSeen.has(day)) {
      throw new Error("Bitta kun uchun bir nechta sozlama bo‘lishi mumkin emas");
    }
    daysSeen.add(day);

    const isOpen = Boolean(item.isOpen);
    const start = String(item.start || "08:00").trim();
    const end = String(item.end || "18:00").trim();

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      throw new Error("Vaqt formati HH:MM ko‘rinishida bo‘lishi kerak (masalan, 08:30)");
    }

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if (sh > 23 || sm > 59 || eh > 23 || em > 59) {
      throw new Error("Kiritilgan soat yoki daqiqa noto‘g‘ri");
    }

    if (start === end) {
      throw new Error("Boshlanish va tugash vaqtlari bir xil bo'lishi mumkin emas");
    }

    clean.push({ day, isOpen, start, end });
  }

  return clean.sort((a, b) => {
    const dayA = a.day === 0 ? 7 : a.day;
    const dayB = b.day === 0 ? 7 : b.day;
    return dayA - dayB;
  });
};

export const getClinicSchedule = async (req, res) => {
  try {
    let settings = await clinicSettingsModel.findOne({ key: "default" }).lean();
    if (!settings) {
      settings = await clinicSettingsModel.create({ key: "default" });
    }
    res.json({ success: true, workingSchedule: settings.workingSchedule });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateClinicSchedule = async (req, res) => {
  try {
    const { workingSchedule } = req.body;
    const cleanSchedule = validateSchedulePayload(workingSchedule);

    if (cleanSchedule.length !== 7) {
      return res.json({ success: false, message: "Haftaning barcha 7 kuni uchun sozlamalar yuborilishi shart" });
    }

    let settings = await clinicSettingsModel.findOneAndUpdate(
      { key: "default" },
      { $set: { workingSchedule: cleanSchedule } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Klinika ish vaqti sozlamalari muvaffaqiyatli saqlandi!", workingSchedule: settings.workingSchedule });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getDentistScheduleForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const dentist = await dentistModel.findById(id).select("workingSchedule").lean();
    if (!dentist) {
      return res.json({ success: false, message: "Shifokor topilmadi" });
    }

    const hasCustom = !!(dentist.workingSchedule && dentist.workingSchedule.length > 0);
    let workingSchedule = dentist.workingSchedule;

    if (!hasCustom) {
      let settings = await clinicSettingsModel.findOne({ key: "default" }).lean();
      if (!settings) {
        settings = await clinicSettingsModel.create({ key: "default" });
      }
      workingSchedule = settings.workingSchedule;
    }

    res.json({ success: true, workingSchedule, isCustom: hasCustom });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateDentistScheduleByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { workingSchedule, isReset } = req.body;

    const dentist = await dentistModel.findById(id);
    if (!dentist) {
      return res.json({ success: false, message: "Shifokor topilmadi" });
    }

    if (isReset) {
      dentist.workingSchedule = undefined;
    } else {
      const cleanSchedule = validateSchedulePayload(workingSchedule);
      if (cleanSchedule.length !== 7) {
        return res.json({ success: false, message: "Haftaning barcha 7 kuni uchun sozlamalar yuborilishi shart" });
      }
      dentist.workingSchedule = cleanSchedule;
    }

    await dentist.save();
    res.json({ success: true, message: "Shifokor ish vaqti sozlamalari saqlandi!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const resetPatientDataController = async (req, res) => {
  try {
    const delPatients = await userModel.deleteMany({});
    const delAppointments = await appointmentModel.deleteMany({});
    const delTreatments = await treatmentModel.deleteMany({});
    const delOrthoQueue = await orthodontistQueueModel.deleteMany({});
    const delPayouts = await commissionPayoutModel.deleteMany({});
    const delExpenses = await expenseModel.deleteMany({});
    const delActLogs = await activityLogModel.deleteMany({});
    const delAppRem = await appointmentReminderLogModel.deleteMany({});
    const delOrthoRem = await orthodontistFollowUpReminderLogModel.deleteMany({});
    const delLocks = await appointmentSlotLockModel.deleteMany({});
    const delTgLogs = await telegramEventLogModel.deleteMany({});
    const delNotifs = await notificationModel.deleteMany({});
    const delCounters = await counterModel.deleteMany({});

    await dentistModel.updateMany({}, { $set: { slots_booked: {} } });
    await dentistLiveStatusModel.updateMany(
      {},
      {
        $set: {
          state: "AVAILABLE",
          currentAppointmentId: null,
          reason: "",
          note: "",
          lastBusyAt: null,
          lastFinishedAt: null,
        },
      }
    );

    res.json({
      success: true,
      message: "Barcha bemorlar, qabullar, to'lovlar va navbatlar muvaffaqiyatli tozalandi! Shifokorlar ma'lumotlariga tegishilmadi.",
      deleted: {
        patients: delPatients.deletedCount,
        appointments: delAppointments.deletedCount,
        treatments: delTreatments.deletedCount,
        orthoQueue: delOrthoQueue.deletedCount,
        expenses: delExpenses.deletedCount,
        payouts: delPayouts.deletedCount,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminFixExaggeratedAmount = async (req, res) => {
  try {
    const CORRECT = 2600000;
    const apps = await appointmentModel.find({
      $or: [
        { _id: "6a809b97f6a1256f176a8800" },
        { "financial.amount": { $gt: 10000000 } },
      ],
    });

    let fixedCount = 0;
    const details = [];

    for (const app of apps) {
      if (app.financial && app.financial.amount > 10000000) {
        app.financial.amount = CORRECT;
        app.financial.paidAmount = CORRECT;
        app.financial.debt = 0;
        app.financial.paymentStatus = "PAID";
        await app.save();
        fixedCount++;
        details.push({ id: app._id, newFinancial: app.financial });

        const tr = await treatmentModel.findOne({ appointmentId: app._id });
        if (tr) {
          tr.amount = CORRECT;
          tr.paidAmount = CORRECT;
          tr.paymentStatus = "PAID";
          if (Array.isArray(tr.payments)) {
            tr.payments.forEach((p) => {
              if (p.amount > CORRECT) p.amount = CORRECT;
            });
          }
          if (tr.commission) {
            const pct = tr.commission.percentAtTreatment || 30;
            tr.commission.calculatedShare = Math.round((CORRECT * pct) / 100);
          }
          await tr.save();
        }
      }
    }

    return res.json({ success: true, fixedCount, details });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const adminGetContactMessages = async (req, res) => {
  try {
    const { default: contactModel } = await import("../models/contactModel.js");
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    const skip = (Number(page) - 1) * Number(limit);
    const messages = await contactModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await contactModel.countDocuments(filter);

    return res.json({
      success: true,
      messages,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const adminUpdateContactStatus = async (req, res) => {
  try {
    const { default: contactModel } = await import("../models/contactModel.js");
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["new", "in_progress", "contacted", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Noto'g'ri status" });
    }
    const updated = await contactModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Xabar topilmadi" });
    }
    return res.json({ success: true, message: "Status yangilandi", messageDoc: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const adminAddPatientHistoricalTreatment = async (req, res) => {
  try {
    const patientId = req.params?.id || req.body?.patientId || req.body?.userId;
    const {
      dentistId,
      treatmentDate,
      treatmentTime = "12:00",
      diagnosis,
      teeth = "",
      procedures = "",
      nextStep = "",
      medicines = "",
      notes = "",
      amount: rawAmount = 0,
      paidAmount: rawPaid = 0,
      paymentMethod = "CASH",
    } = req.body || {};

    if (!patientId) {
      return res.json({ success: false, message: "Bemor ID majburiy" });
    }

    const patient = await userModel.findById(patientId);
    if (!patient) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    const finalDentistId = dentistId || req.body?.dentistID;
    if (!finalDentistId) {
      return res.json({ success: false, message: "Stomatolog tanlanishi shart" });
    }

    const dentistDoc = await dentistModel.findById(finalDentistId).select("name image degree speciality").lean();
    if (!dentistDoc) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    if (!treatmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(treatmentDate).trim())) {
      return res.json({ success: false, message: "Davolash sanasi noto'g'ri (YYYY-MM-DD)" });
    }

    if (!diagnosis || !String(diagnosis).trim()) {
      return res.json({ success: false, message: "Tashxis (diagnos) kiritilishi shart" });
    }

    const normTime = String(treatmentTime || "12:00").trim();
    const cleanDate = String(treatmentDate).trim();
    const dateObj = new Date(`${cleanDate}T${normTime}:00`);
    const dateTimestamp = !Number.isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now();
    const dateJs = !Number.isNaN(dateObj.getTime()) ? dateObj : new Date();

    const amount = Math.max(0, Number(rawAmount) || 0);
    const paidAmount = Math.min(Math.max(0, Number(rawPaid) || 0), amount);
    const paymentStatus = amount === 0 ? "PAID" : paidAmount >= amount ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

    // 1. Create completed historical appointment
    let appointment = null;
    appointment = await appointmentModel.create({
      userId: patient._id,
      dentistID: dentistDoc._id,
      slotDate: cleanDate,
      slotTime: normTime,
      durationMinutes: 30,
      cancelled: false,
      isDone: true,
      isMissed: false,
      status: "DONE",
      isWalkIn: false,
      isHistorical: true,
      createdFrom: "ADMIN",
      date: dateTimestamp,
      createdAt: dateJs,
      diagnosis: String(diagnosis).trim(),
      treatment: String(procedures).trim(),
      financial: {
        amount,
        paidAmount,
        debt: Math.max(0, amount - paidAmount),
        paymentStatus,
      }
    });

    // 2. Prepare X-rays / images if uploaded
    const preparedXrayFiles = Array.isArray(req.files)
      ? await Promise.all(
          req.files.map((file) =>
            prepareImageForJpegStorage(file.buffer, {
              quality: 90,
              originalName: file.originalname,
            }),
          ),
        )
      : [];

    const payments = [];
    if (paidAmount > 0) {
      payments.push({
        paymentRef: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        amount: paidAmount,
        paidAt: dateJs,
        method: paymentMethod || "CASH",
        source: "HISTORICAL_RECORD",
        note: "Eski arxiv davolash to'lovi",
      });
    }

    // 3. Create treatment record
    const treatment = await treatmentModel.create({
      userId: patient._id,
      dentistId: dentistDoc._id,
      appointmentId: appointment._id,
      diagnosis: String(diagnosis).trim(),
      teeth: String(teeth).trim(),
      procedures: String(procedures).trim(),
      nextStep: String(nextStep).trim(),
      medicines: String(medicines).trim(),
      notes: String(notes).trim(),
      amount,
      paidAmount,
      paymentStatus,
      payments,
      isHistorical: true,
      lastPaidAt: paidAmount > 0 ? dateJs : null,
      createdAt: dateJs,
      amountHistory: [
        {
          action: "INITIAL_SET",
          oldAmount: 0,
          newAmount: amount,
          reason: "Eski qog'oz arxivdan kiritilgan davolash summasi",
          changedAt: dateJs,
          changedByRole: "ADMIN",
          changedById: String(req.adminId || ""),
          changedByName: "Admin",
        }
      ],
      xrays: [],
    });

    // Process X-rays if any
    if (req.files && req.files.length) {
      const treatmentId = String(treatment._id);
      const patientIdFolder = patient.patientId || String(patient._id);
      const patientName = patient.name || "patient";
      const safePatientFolder = safeFilenamePart(patientIdFolder, "patient");

      const targetDir = path.join(
        process.cwd(),
        "uploads",
        "private",
        "patients",
        safePatientFolder,
        "treatments",
        treatmentId,
      );
      ensureDir(targetDir);

      for (let index = 0; index < req.files.length; index++) {
        const f = req.files[index];
        const fileName = buildPatientXrayFileName({
          patientId: patientIdFolder,
          patientName,
          index: index + 1,
          ext: ".jpg",
        });
        const finalAbsPath = path.join(targetDir, fileName);
        await writePreparedImageToFile(preparedXrayFiles[index], finalAbsPath);
        try {
          fs.existsSync(f.path) && fs.unlinkSync(f.path);
        } catch {}

        const st = fs.statSync(finalAbsPath);
        treatment.xrays.push({
          path: safeRelPath(finalAbsPath),
          originalName: f.originalname || "",
          mimeType: "image/jpeg",
          sizeBytes: st.size,
          uploadedAt: dateJs,
        });
      }
      await treatment.save();
    }

    appointment.financial.treatmentId = treatment._id;
    await appointment.save();

    return res.json({
      success: true,
      message: "Eski davolash yozuvi muvaffaqiyatli saqlandi!",
      treatment,
      appointment,
    });
  } catch (error) {
    if (appointment?._id) {
      await appointmentModel.deleteOne({ _id: appointment._id }).catch(() => {});
    }
    console.error("adminAddPatientHistoricalTreatment error:", error);
    return res.json({
      success: false,
      message: error.message || "Eski davolash yozuvini saqlashda xatolik yuz berdi",
    });
  }
};

