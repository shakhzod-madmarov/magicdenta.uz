import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import validator from "validator";

import dentistModel from "../models/dentistModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import notificationModel from "../models/notificationModel.js";
import warehouseItemModel from "../models/warehouseItemModel.js";
import warehouseLogModel from "../models/warehouseLogModel.js";
import commissionPayoutModel from "../models/commissionPayoutModel.js";
import dentistWarehouseItemModel from "../models/dentistWarehouseItemModel.js";
import dentistWarehouseLogModel from "../models/dentistWarehouseLogModel.js";
import clinicSettingsModel from "../models/clinicSettingsModel.js";

import {
  prepareImageForJpegStorage,
  writePreparedImageToFile,
} from "../utils/sanitizeImage.js";
import { setAvailable, setBusy } from "../utils/liveDentistStatus.js";
import {
  createAppointmentSafe,
  releaseLocksByAppointment,
} from "../utils/schedule.js";
import { autoMissForDentist } from "../utils/autoMiss.js";
import {
  safeRelPath,
  ensureDir,
  deletePublicFileByUrl,
  buildPatientImageFileName,
  buildDentistImageFileName,
  buildPatientXrayFileName,
  safeFilenamePart,
} from "../utils/files.js";
import {
  buildNowSlot,
  isoToday,
  parseUzDateTimeToUtcDate,
  formatYMD,
} from "../../shared/date.js";
import { toNum, digitsToNum } from "../utils/number.js";
import userModel from "../models/userModel.js";
import { normalizePhone } from "../utils/phone.js";
import {
  completeOrthodontistQueueByAppointment,
  attachAppointmentToUnifiedOrthodontistQueue,
  resolveOrthodontistDentist,
} from "../utils/orthodontistQueueService.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";
import { markTemplateUsed } from "./templateController.js";

const ensureActualVisitTime = async (appointment) => {
  if (!appointment.slotDate || !appointment.slotTime) return false;

  const slotDT = parseUzDateTimeToUtcDate(
    appointment.slotDate,
    appointment.slotTime,
  );
  if (!slotDT || Number.isNaN(slotDT.getTime())) return false;

  const nowTs = Date.now();
  if (slotDT.getTime() <= nowTs) {
    return false;
  }

  await releaseLocksByAppointment(appointment._id);

  const { slotDate, slotTime } = buildNowSlot();
  appointment.slotDate = slotDate;
  appointment.slotTime = slotTime;
  appointment.date = nowTs;

  if (!appointment.startedAt) {
    appointment.startedAt = nowTs;
  }

  return true;
};

const paymentStatusFrom = (amount, paid) => {
  if (amount <= 0) return "UNPAID";
  if (paid >= amount) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "UNPAID";
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

const buildFinancial = (t) => {
  if (!t) return null;
  const amount = Math.max(0, toNum(t.amount));
  const paidAmount = Math.max(0, toNum(t.paidAmount));
  const debt = Math.max(0, amount - paidAmount);
  const payments = Array.isArray(t.payments) ? t.payments : [];
  const lastPaidAt =
    t.lastPaidAt ||
    (payments.length ? payments[payments.length - 1]?.paidAt : null);

  return {
    amount,
    paidAmount,
    paymentStatus: t.paymentStatus || paymentStatusFrom(amount, paidAmount),
    debt,
    treatmentId: t._id,
    payments,
    lastPaidAt,
    requestedPaidNow: toNum(t.requestedPaidNow || 0),
    requestedPaidNowAt: t.requestedPaidNowAt || null,
  };
};

const syncAppointmentFinancialFromTreatment = (appointment, treatment) => {
  if (!appointment || !treatment) return;

  const amount = Math.max(0, toNum(treatment.amount));
  const paidAmount = Math.max(0, toNum(treatment.paidAmount));
  const requestedPaidNow = Math.max(0, toNum(treatment.requestedPaidNow || 0));

  appointment.financial = appointment.financial || {};
  appointment.financial.amount = amount;
  appointment.financial.paidAmount = paidAmount;
  appointment.financial.debt = Math.max(0, amount - paidAmount);
  appointment.financial.paymentStatus =
    treatment.paymentStatus || paymentStatusFrom(amount, paidAmount);
  appointment.financial.lastPaidAt = treatment.lastPaidAt
    ? new Date(treatment.lastPaidAt).getTime()
    : null;
  appointment.financial.requestedPaidNow = requestedPaidNow;
  appointment.financial.requestedPaidNowAt = treatment.requestedPaidNowAt
    ? new Date(treatment.requestedPaidNowAt).getTime()
    : null;
};

const parseYMD = (s) => {
  const v = String(s || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const ymdLocal = (d) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const monthStart = (now = new Date()) => {
  const x = new Date(now);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const dentistDashboardStats = async (req, res) => {
  try {
    const dentistId = req.dentistId;

    const dentistObjId = new mongoose.Types.ObjectId(String(dentistId));

    const mode = String(req.query?.mode || "30d").toLowerCase();
    const fromQ = String(req.query?.from || "").trim();
    const toQ = String(req.query?.to || "").trim();

    const now = new Date();

    const parseYMD = (s) => {
      const v = String(s || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
      const d = new Date(`${v}T00:00:00.000Z`);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const startOfDay = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const endOfDay = (d) => {
      const x = new Date(d);
      x.setHours(23, 59, 59, 999);
      return x;
    };

    const ymdLocal = (d) => {
      const x = new Date(d);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const day = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const monthStart = (now = new Date()) => {
      const x = new Date(now);
      x.setDate(1);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const monthEnd = (now = new Date()) => {
      const x = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      x.setHours(23, 59, 59, 999);
      return x;
    };

    const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    const splitProcedures = (text) => {
      const s = String(text || "").trim();
      if (!s) return [];
      return s
        .split(/[,;\n\r]+/g)
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => (x.length > 60 ? x.slice(0, 60) : x));
    };

    const cleanDiagnosisName = (text) => {
      let s = String(text || "").trim();
      if (!s) return "";
      s = s.replace(/^\d{1,2}\s*[-:–—]?\s*/, "").trim();
      if (!s) return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    let from = null;
    let to = null;
    let appFrom = null;
    let appTo = null;

    if (mode === "today") {
      from = startOfDay(now);
      to = endOfDay(now);
      appFrom = from;
      appTo = to;
    } else if (mode === "7d") {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 6);
      from = s;
      to = endOfDay(now);
      appFrom = from;
      const future7 = new Date(now);
      future7.setDate(future7.getDate() + 7);
      appTo = endOfDay(future7);
    } else if (mode === "30d") {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 29);
      from = s;
      to = endOfDay(now);
      appFrom = from;
      const future30 = new Date(now);
      future30.setDate(future30.getDate() + 30);
      appTo = endOfDay(future30);
    } else if (mode === "month") {
      from = monthStart(now);
      to = monthEnd(now);
      appFrom = from;
      appTo = to;
    } else if (mode === "custom") {
      const f = parseYMD(fromQ) || parseYMD(ymdLocal(now));
      const t = parseYMD(toQ) || parseYMD(ymdLocal(now));
      from = startOfDay(f || now);
      to = endOfDay(t || now);
      if (from.getTime() > to.getTime()) {
        const tmp = from;
        from = startOfDay(to);
        to = endOfDay(tmp);
      }
      appFrom = from;
      appTo = to;
    } else {
      const s = startOfDay(now);
      s.setDate(s.getDate() - 29);
      from = s;
      to = endOfDay(now);
      appFrom = from;
      const future30 = new Date(now);
      future30.setDate(future30.getDate() + 30);
      appTo = endOfDay(future30);
    }

    const treatMatch = {
      dentistId: { $in: [dentistObjId, String(dentistId)] },
      createdAt: { $gte: from, $lte: to },
    };

    const [kpiAgg] = await treatmentModel.aggregate([
      { $match: treatMatch },
      {
        $group: {
          _id: null,
          visits: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);

    const visits = safeNum(kpiAgg?.visits);
    const totalAmount = safeNum(kpiAgg?.totalAmount);
    const totalPaid = safeNum(kpiAgg?.totalPaid);
    const totalDebt = Math.max(0, totalAmount - totalPaid);
    const paymentRate =
      totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    const patientAgg = await treatmentModel.aggregate([
      { $match: treatMatch },
      { $group: { _id: "$userId" } },
      { $count: "count" },
    ]);
    const uniquePatients = safeNum(patientAgg?.[0]?.count);

    const fromY = ymdLocal(appFrom);
    const toY = ymdLocal(appTo);

    const appMatch = {
      dentistID: { $in: [dentistObjId, String(dentistId)] },
      slotDate: { $gte: fromY, $lte: toY },
    };

    const appStatusRows = await appointmentModel.aggregate([
      { $match: appMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusSummary = {
      WAITING: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      MISSED: 0,
      CANCELLED: 0,
    };
    for (const r of appStatusRows) {
      const key = String(r?._id || "");
      if (key in statusSummary) statusSummary[key] = safeNum(r.count);
    }

    let trendFrom = startOfDay(now);
    let trendTo = endOfDay(now);
    let trendDays = 7;

    if (mode === "today" || mode === "7d") {
      trendDays = 7;
      trendFrom = startOfDay(now);
      trendFrom.setDate(trendFrom.getDate() - 6);
      trendTo = endOfDay(now);
    } else if (mode === "30d") {
      trendDays = 30;
      trendFrom = startOfDay(now);
      trendFrom.setDate(trendFrom.getDate() - 29);
      trendTo = endOfDay(now);
    } else if (mode === "month") {
      trendFrom = monthStart(now);
      trendTo = endOfDay(now);
      const diffMs = trendTo.getTime() - trendFrom.getTime();
      trendDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } else if (mode === "custom") {
      trendFrom = startOfDay(from);
      trendTo = endOfDay(to);
      const diffMs = trendTo.getTime() - trendFrom.getTime();
      trendDays = Math.max(
        1,
        Math.min(60, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1),
      );
    }

    const trendRows = await treatmentModel.aggregate([
      {
        $match: {
          dentistId: { $in: [dentistObjId, String(dentistId)] },
          createdAt: { $gte: trendFrom, $lte: trendTo },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          paid: { $sum: "$paidAmount" },
          amount: { $sum: "$amount" },
          visits: { $sum: 1 },
        },
      },
    ]);

    const mapTrend = new Map();
    for (const r of trendRows) {
      const y = String(r._id?.y).padStart(4, "0");
      const m = String(r._id?.m).padStart(2, "0");
      const d = String(r._id?.d).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      mapTrend.set(key, {
        date: key,
        paid: safeNum(r.paid),
        amount: safeNum(r.amount),
        visits: safeNum(r.visits),
      });
    }

    const trend = [];
    for (let i = 0; i < trendDays; i++) {
      const dt = new Date(trendFrom);
      dt.setDate(trendFrom.getDate() + i);
      const key = ymdLocal(dt);
      trend.push(
        mapTrend.get(key) || { date: key, paid: 0, amount: 0, visits: 0 },
      );
    }

    const lastTreatments = await treatmentModel
      .find(treatMatch)
      .select("diagnosis procedures")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    const diagCount = {};
    for (const t of lastTreatments) {
      const rawText = String(t?.diagnosis || t?.procedures || "").trim();
      const parts = splitProcedures(rawText);
      for (const p of parts) {
        const cleaned = cleanDiagnosisName(p);
        if (cleaned) {
          diagCount[cleaned] = (diagCount[cleaned] || 0) + 1;
        }
      }
    }

    const topDiagnoses = Object.entries(diagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return res.json({
      success: true,
      range: { mode, from: ymdLocal(from), to: ymdLocal(to) },
      kpis: {
        visits,
        uniquePatients,
        totalAmount,
        totalPaid,
        totalDebt,
        paymentRate,
      },
      statusSummary,
      trend,
      topDiagnoses,
      topProcedures: topDiagnoses,
    });
  } catch (error) {
    console.error("dentistDashboardStats error:", error);
    return res.json({ success: false, message: "Server xatoligi" });
  }
};

export const dentistList = async (req, res) => {
  try {
    const dentists = await dentistModel
      .find({})
      .select("-password -slots_booked");
    res.json({ success: true, dentists });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const dentistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dentist = await dentistModel.findOne({ email }).select("+password");

    if (!dentist) {
      return res.json({
        success: false,
        message: "Email yoki parol noto‘g‘ri",
      });
    }

    const isMatch = await bcrypt.compare(password, dentist.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Email yoki parol noto‘g‘ri",
      });
    }

    const token = jwt.sign({ dentistId: dentist._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const dentistProfile = async (req, res) => {
  try {
    const dentist = await dentistModel
      .findById(req.dentistId)
      .select("-password");
    if (!dentist)
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    res.json({ success: true, dentist });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const dentistChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body || {};

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.json({
        success: false,
        message: "Barcha maydonlar majburiy",
      });
    }

    if (String(newPassword).length < 6) {
      return res.json({
        success: false,
        message: "Yangi parol kamida 6 ta belgidan iborat bo‘lsin",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: "Yangi parollar mos emas",
      });
    }

    const dentist = await dentistModel
      .findById(req.dentistId)
      .select("+password");

    if (!dentist) {
      return res.json({
        success: false,
        message: "Stomatolog topilmadi",
      });
    }

    const ok = await bcrypt.compare(String(oldPassword), dentist.password);

    if (!ok) {
      return res.json({
        success: false,
        message: "Eski parol noto‘g‘ri",
      });
    }

    dentist.password = await bcrypt.hash(String(newPassword), 10);
    await dentist.save();

    return res.json({
      success: true,
      message: "Parol muvaffaqiyatli o‘zgartirildi",
    });
  } catch (e) {
    console.error("dentistChangePassword error:", e);
    return res.json({
      success: false,
      message: "Server xatosi",
    });
  }
};

export const updateDentistProfile = async (req, res) => {
  try {
    const dentist = await dentistModel.findById(req.dentistId);
    if (!dentist) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    let {
      name,
      phone,
      gender,
      speciality,
      degree,
      experience,
      about,
      available,
    } = req.body;

    if (typeof speciality === "string") {
      try {
        speciality = JSON.parse(speciality);
      } catch {}
    }

    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (phone?.trim()) update.phone = phone.trim();
    if (["male", "female"].includes(gender)) update.gender = gender;
    if (Array.isArray(speciality)) update.speciality = speciality;
    if (degree !== undefined) update.degree = String(degree || "");
    const exp = Number(experience);
    if (!Number.isNaN(exp) && exp >= 0) update.experience = exp;
    if (about !== undefined) update.about = String(about || "");
    if (available !== undefined) {
      update.available = available === true || available === "true";
    }

    const oldImage = dentist.image;
    const preparedDentistImage = req.file?.buffer
      ? await prepareImageForJpegStorage(req.file.buffer, {
          originalName: req.file.originalname,
        })
      : null;

    if (preparedDentistImage) {
      const fileName = buildDentistImageFileName({
        dentistId: dentist.dentistId || String(dentist._id),
        dentistName: (name && name.trim()) || dentist.name,
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

      update.image = `/uploads/dentists/${fileName}`;
    }

    const updated = await dentistModel
      .findByIdAndUpdate(req.dentistId, update, { new: true })
      .select("-password");

    if (
      preparedDentistImage &&
      oldImage &&
      oldImage !== updated?.image &&
      String(oldImage).startsWith("/uploads/dentists/")
    ) {
      deletePublicFileByUrl(oldImage);
    }

    return res.json({
      success: true,
      message: "Akkaunt muvaffaqiyatli yangilandi",
      dentist: updated,
    });
  } catch (error) {
    console.error("updateDentistProfile error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const dentistAppointments = async (req, res) => {
  try {
    autoMissForDentist(req.dentistId).catch((e) => {
      console.error("autoMissForDentist failed:", e.message);
    });
    const apps = await appointmentModel
      .find({ dentistID: req.dentistId })
      .populate("userId", "name phone image +infectiousDiseaseMarkers")
      .sort({ date: -1 });

    const appointmentIds = apps.map((a) => a._id);

    const [treatments, queues] = await Promise.all([
      treatmentModel
        .find({ appointmentId: { $in: appointmentIds } })
        .select(
          "_id appointmentId amount paidAmount paymentStatus requestedPaidNow requestedPaidNowAt payments lastPaidAt",
        )
        .lean(),
      orthodontistQueueModel
        .find({ appointmentId: { $in: appointmentIds } })
        .select("appointmentId queueNo")
        .lean(),
    ]);

    const byAppointment = {};
    for (const t of treatments) {
      byAppointment[String(t.appointmentId)] = buildFinancial(t);
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
        const key = String(a.slotDate);
        if (!allGroups[key]) allGroups[key] = [];
        allGroups[key].push(a);
      }
    }

    const dynamicQueueMap = new Map();
    for (const dateKey in allGroups) {
      const group = allGroups[dateKey];
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

    const list = apps.map((a) => {
      const obj = a.toObject();
      const fin = byAppointment[String(obj._id)] || null;
      const qNo = queueMap.get(String(obj._id)) || dynamicQueueMap.get(String(obj._id)) || null;

      return {
        ...obj,
        queueNo: qNo,
        userData: obj.userId
          ? {
              _id: obj.userId._id,
              name: obj.userId.name,
              phone: obj.userId.phone,
              image: obj.userId.image,
              hasInfectiousDiseaseMarker:
                Array.isArray(obj.userId.infectiousDiseaseMarkers) &&
                obj.userId.infectiousDiseaseMarkers.length > 0,
            }
          : null,
        userId: obj.userId?._id || obj.userId,
        financial: fin,
        lastPaidAt: fin?.lastPaidAt ?? null,
      };
    });

    return res.json({ success: true, appointments: list });
  } catch (error) {
    console.error("dentistAppointments error:", error);
    return res.json({ success: false, message: "Server xatoligi" });
  }
};

export const dentistPatients = async (req, res) => {
  try {
    const dentistObjId = new mongoose.Types.ObjectId(req.dentistId);
    const dentistIdStr = String(req.dentistId);

    // 1. Fetch all registered patients in the clinic
    const allUsers = await userModel
      .find({})
      .select("-password +infectiousDiseaseMarkers")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all appointments for this dentist to compute visit counts and last visit
    const apps = await appointmentModel
      .find({ dentistID: { $in: [dentistObjId, dentistIdStr] } })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const appMap = new Map();
    for (const a of apps) {
      const uid = String(a.userId || "");
      if (!uid) continue;

      const visitTime = a.startedAt || a.date || a.createdAt || null;
      if (!appMap.has(uid)) {
        appMap.set(uid, {
          visitsCount: 1,
          lastVisitAt: visitTime,
        });
      } else {
        const item = appMap.get(uid);
        item.visitsCount += 1;
        const existingTs = item.lastVisitAt ? new Date(item.lastVisitAt).getTime() : 0;
        const nextTs = visitTime ? new Date(visitTime).getTime() : 0;
        if (nextTs > existingTs) {
          item.lastVisitAt = visitTime;
        }
      }
    }

    // 3. Compute debt per patient for this dentist
    const treatments = await treatmentModel
      .find({ dentistId: { $in: [dentistObjId, dentistIdStr] } })
      .select("userId amount paidAmount")
      .lean();

    const debtByUser = {};
    for (const t of treatments) {
      const uid = String(t.userId || "");
      if (!uid) continue;
      const debt = Math.max(0, toNum(t.amount) - toNum(t.paidAmount));
      debtByUser[uid] = (debtByUser[uid] || 0) + debt;
    }

    const list = allUsers.map((u) => {
      const uid = String(u._id);
      const appInfo = appMap.get(uid) || {};

      return {
        userId: u._id,
        patientId: u.patientId || "",
        name: u.name || "",
        phone: u.phone || "",
        image: u.image || "",
        gender: u.gender || "",
        DOB: u.DOB || "",
        address: u.address || { line1: "", line2: "" },
        allergy: u.allergy || "",
        medicalWarnings: u.medicalWarnings || "",
        note: u.note || "",
        telegram: u.telegram || {},
        infectiousDiseaseMarkers: Array.isArray(u.infectiousDiseaseMarkers)
          ? u.infectiousDiseaseMarkers
          : [],
        hasInfectiousDiseaseMarker:
          Array.isArray(u.infectiousDiseaseMarkers) &&
          u.infectiousDiseaseMarkers.length > 0,
        lastVisitAt: appInfo.lastVisitAt || null,
        visitsCount: appInfo.visitsCount || 0,
        totalDebt: debtByUser[uid] || 0,
      };
    });

    return res.json({ success: true, patients: list });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const dentistStartAppointment = async (req, res) => {
  try {
    const dentistID = req.dentistId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.json({ success: false, message: "appointmentId kerak" });
    }

    const appointment = await appointmentModel.findOne({
      _id: appointmentId,
      dentistID,
      cancelled: false,
      status: "WAITING",
    });

    if (!appointment) {
      return res.json({
        success: false,
        message: "Uchrashuvni boshlab bo‘lmaydi",
      });
    }

    const active = await appointmentModel.findOne({
      dentistID,
      status: "IN_PROGRESS",
      cancelled: false,
    });

    if (active) {
      return res.json({
        success: false,
        message: "Avvalgi qabul tugatilmagan",
      });
    }

    try {
      const ortho = await resolveOrthodontistDentist().catch(() => null);

      if (
        ortho &&
        String(appointment.dentistID) === String(ortho._id) &&
        String(appointment.slotDate) === String(isoToday())
      ) {
        const orthoEntry = await orthodontistQueueModel
          .findOne({
            dentistId: dentistID,
            dayKey: appointment.slotDate,
            $or: [
              { appointmentId: appointment._id },
              { patientId: appointment.userId },
            ],
          })
          .sort({ createdAt: -1 });

        if (orthoEntry && ["WAITING", "CALLED"].includes(orthoEntry.status)) {
          orthoEntry.status = "IN_PROGRESS";
          orthoEntry.calledAt = orthoEntry.calledAt || new Date();
          await orthoEntry.save();
        }
      }
    } catch (guardError) {
      console.error("dentistStartAppointment ortho sync error:", guardError);
    }

    appointment.status = "IN_PROGRESS";
    appointment.startedAt = Date.now();
    await appointment.save();

    await setBusy({
      dentistID,
      appointmentId: appointment._id,
      reason: appointment.isWalkIn ? "WALK_IN" : "APPOINTMENT",
    });

    return res.json({
      success: true,
      message: "Qabul boshlandi",
      appointmentId: appointment._id,
    });
  } catch (e) {
    return res.json({ success: false, message: e.message || "Xatolik" });
  }
};

export const payAppointmentDebt = async (req, res) => {
  try {
    const appointmentId = String(req.body?.appointmentId || "").trim();
    const payAmount = digitsToNum(req.body?.payAmount);

    if (!appointmentId || payAmount <= 0) {
      return res.json({
        success: false,
        message: "To‘lov summasi yoki uchrashuv noto‘g‘ri",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment)
      return res.json({ success: false, message: "Uchrashuv topilmadi" });

    if (String(appointment.dentistID) !== String(req.dentistId)) {
      return res.json({
        success: false,
        message: "Sizga tegishli bo‘lmagan uchrashuv",
      });
    }

    if (appointment.cancelled) {
      return res.json({
        success: false,
        message: "Bekor qilingan uchrashuvga to‘lov qo‘shib bo‘lmaydi",
      });
    }

    const treatment = await treatmentModel.findOne({ appointmentId }).exec();
    if (!treatment) {
      return res.json({
        success: false,
        message: "Davolash maʼlumoti topilmadi (avval Qabulni yakunlang)",
      });
    }

    const amount = Math.max(0, toNum(treatment.amount));
    const paid = Math.max(0, toNum(treatment.paidAmount));
    const debt = Math.max(0, amount - paid);

    if (amount <= 0)
      return res.json({
        success: false,
        message: "Narx 0 bo‘lsa to‘lov so‘rovi yuborilmaydi",
      });
    if (debt <= 0)
      return res.json({ success: true, message: "Bu uchrashuvda qarz yo‘q" });
    if (payAmount > debt)
      return res.json({
        success: false,
        message: "So‘rov qarzdan katta bo‘lishi mumkin emas",
      });

    const newRequest = Math.min(payAmount, debt);
    const prevReq = Math.max(0, toNum(treatment.requestedPaidNow || 0));
    const nextReq = Math.min(debt, prevReq + newRequest);

    treatment.requestedPaidNow = nextReq;
    treatment.requestedPaidNowAt = new Date();

    syncAppointmentFinancialFromTreatment(appointment, treatment);

    await treatment.save();
    await appointment.save();

    return res.json({
      success: true,
      message:
        "To‘lov so‘rovi adminga yuborildi. Tasdiqlangandan keyin hisobga tushadi.",
      requestedPaidNow: treatment.requestedPaidNow,
      requestedPaidNowAt: treatment.requestedPaidNowAt,
    });
  } catch (error) {
    console.error("payAppointmentDebt error:", error);
    res.json({ success: false, message: "Server xatoligi" });
  }
};

export const dentistPatientHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.json({ success: false, message: "Bemor ID kerak" });

    const apps = await appointmentModel
      .find({ dentistID: req.dentistId, userId })
      .populate(
        "userId",
        "patientId name phone email gender DOB address createdAt image allergy medicalWarnings note telegram +infectiousDiseaseMarkers",
      )
      .sort({ date: -1 });

    if (!apps.length) {
      const directUser = await userModel
        .findById(userId)
        .select("-password +infectiousDiseaseMarkers")
        .lean();

      return res.json({
        success: true,
        patient: directUser
          ? {
              _id: directUser._id,
              id: String(directUser._id),
              patientId: directUser.patientId || "",
              name: directUser.name || "",
              phone: directUser.phone || "",
              email: directUser.email || "",
              gender: directUser.gender || "",
              DOB: directUser.DOB || directUser.dob || null,
              address: directUser.address || {},
              createdAt: directUser.createdAt || null,
              image: directUser.image || "",
              allergy: directUser.allergy || "",
              medicalWarnings: directUser.medicalWarnings || "",
              note: directUser.note || "",
              telegram: directUser.telegram || {},
              infectiousDiseaseMarkers: Array.isArray(
                directUser.infectiousDiseaseMarkers,
              )
                ? directUser.infectiousDiseaseMarkers
                : [],
            }
          : null,
        totals: { totalDebt: 0, totalAmount: 0, totalPaid: 0 },
        history: [],
      });
    }

    const appointmentIds = apps.map((a) => a._id);

const treatments = await treatmentModel
  .find({ appointmentId: { $in: appointmentIds } })
  .select(
    "_id appointmentId diagnosis teeth procedures nextStep medicines notes sourceTemplateId sourceTemplateTitle nextVisitDate nextVisitTime amount paidAmount paymentStatus payments amountHistory lastPaidAt createdAt xrays",
  )
  .lean();

const dentist = await dentistModel
  .findById(req.dentistId)
  .select("name phone image degree speciality")
  .lean();

const orthodontistQueueEntries = await orthodontistQueueModel
  .find({
    dentistId: req.dentistId,
    patientId: userId,
    appointmentId: { $in: appointmentIds },
  })
  .select(
    "appointmentId queueNo status source firstVisit visitPurpose visitPurposeLabel joinedAt arrivedAt calledAt doneAt missedAt cancelledAt followUpDays followUpSelectedAt nextPlannedDate progressImages",
  )
  .sort({ doneAt: -1, createdAt: -1 })
  .lean();

const dentistData = dentist
  ? {
      _id: dentist._id,
      name: dentist.name,
      phone: dentist.phone,
      image: dentist.image,
      degree: dentist.degree,
      speciality: dentist.speciality,
    }
  : null;

const byAppointment = {};
const orthoByAppointment = {};
let totalAmount = 0;
let totalPaid = 0;
let totalDebt = 0;

for (const t of treatments) {
  const fin = buildFinancial(t);

  const obj = {
    _id: t._id,
    treatmentId: t._id,
    diagnosis: t.diagnosis || "",
    teeth: t.teeth || "",
    procedures: t.procedures || "",
    nextStep: t.nextStep || "",
    medicines: t.medicines || "",
    notes: t.notes || "",
    sourceTemplateId: t.sourceTemplateId || null,
    sourceTemplateTitle: t.sourceTemplateTitle || "",
    nextVisitDate: t.nextVisitDate || "",
    nextVisitTime: t.nextVisitTime || "",
    amount: fin?.amount || 0,
    paidAmount: fin?.paidAmount || 0,
    paymentStatus: fin?.paymentStatus || "UNPAID",
    debt: fin?.debt || 0,
    payments: fin?.payments || [],
    amountHistory: Array.isArray(t.amountHistory) ? t.amountHistory : [],
    lastPaidAt: fin?.lastPaidAt || null,
    xrays: Array.isArray(t.xrays) ? t.xrays : [],
    createdAt: t.createdAt,
  };

  byAppointment[String(t.appointmentId)] = obj;

  totalAmount += obj.amount;
  totalPaid += obj.paidAmount;
  totalDebt += obj.debt;
}

    for (const row of orthodontistQueueEntries) {
      orthoByAppointment[String(row.appointmentId)] = row;
    }

    const u = apps[0].userId;
    const patient = {
      _id: u?._id || userId,
      id: String(u?._id || userId),
      patientId: u?.patientId || "",
      name: u?.name || "",
      phone: u?.phone || "",
      email: u?.email || "",
      gender: u?.gender || "",
      DOB: u?.DOB || u?.dob || null,
      address: u?.address || {},
      createdAt: u?.createdAt || null,
      image: u?.image || "",
      allergy: u?.allergy || "",
      medicalWarnings: u?.medicalWarnings || "",
      note: u?.note || "",
      telegram: u?.telegram || {},
      infectiousDiseaseMarkers: Array.isArray(u?.infectiousDiseaseMarkers)
        ? u.infectiousDiseaseMarkers
        : [],
    };

    const history = apps.map((a) => {
      const plain = a.toObject();

      const isCancelled = Boolean(plain.isCancelled || plain.cancelled);

      const appointment = {
        ...plain,
        isCancelled,
        cancelled: Boolean(plain.cancelled),
        userId: plain.userId?._id || plain.userId,
        userData: plain.userId
          ? {
              _id: plain.userId._id,
              name: plain.userId.name,
              phone: plain.userId.phone,
              image: plain.userId.image,
            }
          : null,
        dentistId: dentistData?._id || plain.dentistID,
        dentistData: dentistData,
      };

      return {
        appointment,
        dentistData: dentistData,
        treatment: byAppointment[String(a._id)] || null,
        orthodontistQueue: orthoByAppointment[String(a._id)] || null,
      };
    });

    return res.json({
      success: true,
      patient,
      totals: { totalDebt, totalAmount, totalPaid },
      history,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

export const checkoutVisit = async (req, res) => {
  try {
    const appointmentId = String(req.body?.appointmentId || "").trim();
    const diagnosis = String(req.body?.diagnosis || "");
    const teeth = String(req.body?.teeth || "");
    const procedures = String(req.body?.procedures || "");
    const nextStep = String(req.body?.nextStep || "");
    const medicines = String(req.body?.medicines || "");
    const notes = String(req.body?.notes || "");
    const templateId = String(req.body?.templateId || "").trim();
    const nextVisitDate = String(req.body?.nextVisitDate || "");
    const nextVisitTime = String(req.body?.nextVisitTime || "");
    const amount = digitsToNum(req.body?.amount);
    const paidNow = digitsToNum(req.body?.paidNow);

    if (!appointmentId)
      return res.json({ success: false, message: "Uchrashuv ID kerak" });
    if (!diagnosis.trim())
      return res.json({ success: false, message: "Diagnos majburiy" });
    if (amount < 0)
      return res.json({ success: false, message: "Umumiy narx noto‘g‘ri" });
    if (paidNow < 0)
      return res.json({ success: false, message: "To‘langan summa noto‘g‘ri" });
    if (paidNow > amount)
      return res.json({
        success: false,
        message: "To‘langan summa umumiy narxdan katta bo‘lishi mumkin emas",
      });

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

    const appointment = await appointmentModel
      .findById(appointmentId)
      .populate("userId", "patientId name");
    if (!appointment)
      return res.json({ success: false, message: "Uchrashuv topilmadi" });

    if (String(appointment.dentistID) !== String(req.dentistId)) {
      return res.json({
        success: false,
        message: "Sizga tegishli bo‘lmagan uchrashuv",
      });
    }

    if (appointment.cancelled) {
      return res.json({
        success: false,
        message: "Bekor qilingan uchrashuvni yakunlab bo‘lmaydi",
      });
    }

    if (nextVisitDate.trim() && nextVisitTime.trim()) {
      const normalizedNextDate = String(nextVisitDate).trim();
      const normalizedNextTime = String(nextVisitTime).trim();

      const candidate = parseUzDateTimeToUtcDate(
        normalizedNextDate,
        normalizedNextTime,
      );

      if (!candidate || Number.isNaN(candidate.getTime())) {
        return res.json({
          success: false,
          message: "Keyingi ko‘rik sanasi yoki vaqti noto‘g‘ri",
        });
      }

      const now = new Date();
      if (candidate.getTime() <= now.getTime()) {
        return res.json({
          success: false,
          message:
            "Keyingi ko‘rik o‘tgan vaqtda bo‘lishi mumkin emas. Iltimos, kelajakdagi vaqtni tanlang.",
        });
      }

      const existingNext = await appointmentModel
        .findOne({
          dentistID: appointment.dentistID,
          slotDate: normalizedNextDate,
          slotTime: normalizedNextTime,
          cancelled: { $ne: true },
          _id: { $ne: appointment._id },
        })
        .select("_id")
        .lean();

      if (existingNext) {
        return res.json({
          success: false,
          message:
            "Bu sana va vaqtda allaqachon uchrashuv bor. Iltimos, boshqa vaqtni tanlang.",
        });
      }
    }

    await ensureActualVisitTime(appointment);

    appointment.status = "DONE";

    let treatment = await treatmentModel.findOne({ appointmentId }).exec();

    if (!treatment) {
  const initialAmount = Math.max(0, amount);

  treatment = await treatmentModel.create({
    userId: appointment.userId,
    dentistId: appointment.dentistID,
    appointmentId: appointment._id,
    diagnosis,
    teeth,
    procedures,
    nextStep,
    medicines,
    notes,
    sourceTemplateId: templateId || null,
    sourceTemplateTitle: "",
    nextVisitDate,
    nextVisitTime,
    amount: initialAmount,
    paidAmount: 0,
    paymentStatus: "UNPAID",
    payments: [],
    amountHistory: [
      {
        action: "INITIAL_SET",
        oldAmount: 0,
        newAmount: initialAmount,
        reason: "Qabul yakunida birinchi summa kiritildi",
        changedAt: new Date(),
        changedByRole: "SYSTEM",
        changedById: "",
        changedByName: "Tizim",
        confirmedDentistId: String(req.dentistId || ""),
        confirmedDentistName: "",
      },
    ],
    lastPaidAt: null,
    requestedPaidNow: 0,
    requestedPaidNowAt: null,
    xrays: [],
  });
} else {
  treatment.diagnosis = diagnosis;
  treatment.teeth = teeth;
  treatment.procedures = procedures;
  treatment.nextStep = nextStep;
  treatment.medicines = medicines;
  treatment.notes = notes;
  treatment.nextVisitDate = nextVisitDate;
  treatment.nextVisitTime = nextVisitTime;
  treatment.amount = Math.max(0, toNum(treatment.amount));
  treatment.paidAmount = Math.min(
    Math.max(0, toNum(treatment.paidAmount)),
    treatment.amount,
  );
  treatment.paymentStatus = paymentStatusFrom(
    treatment.amount,
    treatment.paidAmount,
  );
}

    if (req.files && req.files.length) {
      const treatmentId = String(treatment._id);
      const patientDoc = appointment.userId;

      const patientIdFolder =
        (patientDoc && patientDoc.patientId) ||
        String(patientDoc?._id || appointment.userId);

      const patientName = patientDoc?.name || "patient";
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
          uploadedAt: new Date(),
        });
      }
    }

    let nextAppointmentId = null;
    if (nextVisitDate.trim() && nextVisitTime.trim()) {
      try {
        const nextApp = await createAppointmentSafe({
          userId: appointment.userId,
          dentistID: appointment.dentistID,
          slotDate: nextVisitDate,
          slotTime: nextVisitTime,
          createdFrom: "DENTIST",
        });
        nextAppointmentId = nextApp._id;
      } catch (e) {
        if (req.files) {
          for (const f of req.files) {
            fs.existsSync(f.path) && fs.unlinkSync(f.path);
          }
        }
        throw e;
      }
    }

    treatment.nextAppointmentId = nextAppointmentId;

    const total = Math.max(0, toNum(treatment.amount));
    const alreadyPaid = Math.max(0, toNum(treatment.paidAmount));
    const debt = Math.max(0, total - alreadyPaid);

    if (paidNow > 0 && debt > 0) {
      treatment.requestedPaidNow = Math.min(paidNow, debt);
      treatment.requestedPaidNowAt = new Date();
    } else {
      treatment.requestedPaidNow = 0;
      treatment.requestedPaidNowAt = null;
    }

    if (templateId) {
      const usedTemplate = await markTemplateUsed({
        dentistId: req.dentistId,
        templateId,
      });

      if (usedTemplate) {
        treatment.sourceTemplateId = usedTemplate._id;
        treatment.sourceTemplateTitle = usedTemplate.title || "";
      } else {
        treatment.sourceTemplateId = null;
        treatment.sourceTemplateTitle = "";
      }
    } else {
      treatment.sourceTemplateId = null;
      treatment.sourceTemplateTitle = "";
    }

    syncAppointmentFinancialFromTreatment(appointment, treatment);

    await treatment.save();
    await appointment.save();
    await setAvailable(req.dentistId, { finishedAt: Date.now() });

    await completeOrthodontistQueueByAppointment({
      appointmentId: appointment._id,
      dentistId: req.dentistId,
    });

    res.json({
      success: true,
      message:
        treatment.requestedPaidNow > 0
          ? "Qabul saqlandi va to‘lov so‘rovi adminga yuborildi."
          : "Qabul saqlandi.",
      treatmentId: treatment._id,
      nextAppointmentId,
      requestedPaidNow: treatment.requestedPaidNow || 0,
    });
  } catch (e) {
    console.error("checkoutVisit error:", e);
    res.json({ success: false, message: e.message });
  }
};

const buildRangeStats = async (dentistId, daysBack) => {
  const now = new Date();

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (daysBack - 1));

  const match = { dentistId, createdAt: { $gte: start, $lte: end } };

  const rows = await treatmentModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalPaid: { $sum: "$paidAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!rows.length)
    return { totalAmount: 0, totalPaid: 0, totalDebt: 0, count: 0 };

  const { totalAmount = 0, totalPaid = 0, count = 0 } = rows[0];
  return {
    totalAmount,
    totalPaid,
    totalDebt: Math.max(0, totalAmount - totalPaid),
    count,
  };
};

export const dentistEarningsOverview = async (req, res) => {
  try {
    const dentistId = req.dentistId;

    const [today, week, month] = await Promise.all([
      buildRangeStats(dentistId, 1),
      buildRangeStats(dentistId, 7),
      buildRangeStats(dentistId, 30),
    ]);

    res.json({ success: true, overview: { today, week, month } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getDentistNotifications = async (req, res) => {
  try {
    const list = await notificationModel
      .find({
        receiverRole: "DENTIST",
        receiverId: req.dentistId,
        isRead: false,
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications: list });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const markDentistNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationModel.updateOne(
      { _id: id, receiverRole: "DENTIST", receiverId: req.dentistId },
      { $set: { isRead: true } },
    );

    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const dentistCreatePatient = async (req, res) => {
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
    console.error("dentistCreatePatient error:", e);
    return res.json({ success: false, message: e.message });
  }
};

export const dentistVerifyPatientInfectiousDiseaseAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const [hasAppointment, hasTreatment] = await Promise.all([
      appointmentModel.exists({ userId: id, dentistID: req.dentistId }),
      treatmentModel.exists({ userId: id, dentistId: req.dentistId }),
    ]);

    if (!hasAppointment && !hasTreatment) {
      return res.json({
        success: false,
        message: "Bu bemorni faqat bog‘langan stomatolog yangilashi mumkin",
      });
    }

    const ok = await verifyDentistSensitivePassword(
      req.dentistId,
      req.body?.password,
    );

    if (!ok) {
      return res.json({ success: false, message: "Parol noto‘g‘ri" });
    }

    return res.json({ success: true, message: "Ruxsat berildi" });
  } catch (error) {
    console.error("dentistVerifyPatientInfectiousDiseaseAccess error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const dentistUpdatePatientInfectiousDiseaseMarkers = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const [hasAppointment, hasTreatment] = await Promise.all([
      appointmentModel.exists({ userId: id, dentistID: req.dentistId }),
      treatmentModel.exists({ userId: id, dentistId: req.dentistId }),
    ]);

    if (!hasAppointment && !hasTreatment) {
      return res.json({
        success: false,
        message: "Bu bemorni faqat bog‘langan stomatolog yangilashi mumkin",
      });
    }

    const ok = await verifyDentistSensitivePassword(
      req.dentistId,
      req.body?.password,
    );

    if (!ok) {
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
    console.error("dentistUpdatePatientInfectiousDiseaseMarkers error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const dentistCalendarAvailability = async (req, res) => {
  try {
    const fromDate = req.query?.fromDate;
    const days = Math.min(Math.max(Number(req.query?.days || 7), 1), 14);
    console.log("[BACKEND-LOG] dentistCalendarAvailability: req.dentistId =", req.dentistId, "fromDate =", fromDate, "days =", days);
    
    const { getDetailedScheduleForDentist } = await import("../utils/schedule.js");
    
    const data = await getDetailedScheduleForDentist({
      dentistID: req.dentistId,
      startDate: fromDate,
      days,
    });

    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("dentistCalendarAvailability error:", error);
    return res.json({
      success: false,
      message: error.message || "Kalendar yuklanmadi",
    });
  }
};

export const dentistCreateManualAppointment = async (req, res) => {
  try {
    const { userId, patientId, phone, name, slotDate, slotTime } = req.body || {};

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

    const dentistDoc = await dentistModel.findById(req.dentistId).select("name image").lean();
    if (!dentistDoc) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    const appointment = await createAppointmentSafe({
      userId: patient._id,
      dentistID: req.dentistId,
      slotDate,
      slotTime,
      userData: patient,
      dentistData: {
        _id: dentistDoc._id,
        name: dentistDoc.name,
        image: dentistDoc.image,
      },
      createdFrom: "DENTIST",
    });

    // Notify dentist via Telegram for ALL new scheduled bookings (today or future)
    try {
      const { notifyDentistAboutNewBooking } = await import("../utils/telegramBot.js");
      await notifyDentistAboutNewBooking({
        dentistId: req.dentistId,
        patientName: patient.name,
        slotDate,
        slotTime,
        note: req.body?.note || "",
        createdFrom: "DENTIST",
      });
    } catch (err) {
      console.warn("[dentistCreateManualAppointment] Dentist Telegram notify failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Qabul muvaffaqiyatli yaratildi",
      appointment,
    });
  } catch (error) {
    console.error("dentistCreateManualAppointment error:", error);
    return res.json({
      success: false,
      message: error.message || "Qabul yaratishda xatolik yuz berdi"
    });
  }
};

export const dentistCancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.json({ success: false, message: "Uchrashuv topilmadi" });
    }

    // Ensure the dentist belongs to this appointment
    if (String(appointment.dentistID) !== String(req.dentistId)) {
      return res.json({ success: false, message: "Ruxsat berilmagan" });
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
    console.error("dentistCancelAppointment error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const dentistRescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotDate, slotTime, reason } = req.body || {};

    const dentistDoc = await dentistModel.findById(req.dentistId).select("name").lean();
    const dentistName = dentistDoc?.name ? `Dr. ${dentistDoc.name}` : "Shifokor";

    const { rescheduleAppointmentSafe } = await import("../utils/schedule.js");

    const updatedAppointment = await rescheduleAppointmentSafe({
      appointmentId: id,
      newSlotDate: slotDate,
      newSlotTime: slotTime,
      newDentistID: req.dentistId,
      rescheduledBy: "DENTIST",
      rescheduledByName: dentistName,
      reason: reason || "",
    });

    // Notify dentist via Telegram
    try {
      const { notifyDentistAboutReschedule } = await import("../utils/telegramBot.js");
      const historyList = updatedAppointment.rescheduleHistory || [];
      const history = historyList[historyList.length - 1];
      await notifyDentistAboutReschedule({
        dentistId: req.dentistId,
        patientName: updatedAppointment.userId?.name || "Bemor",
        oldSlotDate: history?.oldSlotDate || "",
        oldSlotTime: history?.oldSlotTime || "",
        newSlotDate: slotDate,
        newSlotTime: slotTime,
        rescheduledByName: dentistName,
        rescheduledByRole: "DENTIST",
        reason: reason || "",
      });
    } catch (err) {
      console.warn("[dentistRescheduleAppointment] Telegram notify failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Qabul vaqti muvaffaqiyatli ko'chirildi",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("dentistRescheduleAppointment error:", error);
    return res.json({
      success: false,
      message: error.message || "Qabul vaqtini ko'chirishda xatolik yuz berdi",
    });
  }
};

// Dentist Finance & Warehouse integration
export const dentistGetWarehouseItems = async (req, res) => {
  try {
    const items = await warehouseItemModel.find({ isActive: true }).sort({ name: 1 });
    return res.json({ success: true, items });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const dentistStockOutItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, reason, note } = req.body;
    const dentistId = req.dentistId;

    const item = await warehouseItemModel.findById(id);
    if (!item || !item.isActive) {
      return res.json({ success: false, message: "Material topilmadi" });
    }

    const inputQty = Number(qty);
    if (Number.isNaN(inputQty) || inputQty <= 0) {
      return res.json({ success: false, message: "Miqdor noto'g'ri" });
    }

    if (item.quantity < inputQty) {
      return res.json({
        success: false,
        message: `Omborda yetarli qoldiq yo'q. Qoldiq: ${item.quantity} ${item.unit}`,
      });
    }

    const dentistDoc = await dentistModel.findById(dentistId);
    const dentistName = dentistDoc ? dentistDoc.name : "Stomatolog";

    // Decrement item stock
    item.quantity = item.quantity - inputQty;
    await item.save();

    // Create log with dentistID
    const logEntry = await warehouseLogModel.create({
      itemId: item._id,
      type: "OUT",
      qty: inputQty,
      pricePerUnit: item.unitPrice || 0,
      totalPrice: inputQty * (item.unitPrice || 0),
      reason: reason || "Stomatolog tomonidan olindi",
      dentistID: dentistId,
      note: note || "",
      operatorName: dentistName,
    });

    return res.json({ success: true, message: "Material muvaffaqiyatli olindi", item, log: logEntry });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const dentistGetMyFinanceOverview = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { start, end } = req.query;

    const payoutFilter = { dentistId };
    const sharedLogFilter = { dentistID: dentistId, type: "OUT" };
    const personalLogFilter = { dentistId, type: "OUT" };

    if (start && end) {
      const startDate = new Date(`${start}T00:00:00.000Z`);
      const endDate = new Date(`${end}T23:59:59.999Z`);

      payoutFilter.$or = [
        { payoutDate: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } }
      ];

      sharedLogFilter.$or = [
        { date: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } }
      ];

      personalLogFilter.$or = [
        { date: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } }
      ];
    }

    // Get all payouts to this dentist
    const payouts = await commissionPayoutModel
      .find(payoutFilter)
      .sort({ createdAt: -1 });

    // Get stock-outs from main/shared warehouse populated by this dentist
    const sharedLogs = await warehouseLogModel
      .find(sharedLogFilter)
      .populate("itemId", "name category unit")
      .lean();

    // Get stock-outs from dentist's own personal warehouse
    const personalLogs = await dentistWarehouseLogModel
      .find(personalLogFilter)
      .populate("itemId", "name category unit")
      .lean();

    const mergedLogs = [];

    // Process shared warehouse logs
    sharedLogs.forEach((log) => {
      mergedLogs.push({
        _id: log._id,
        date: log.date || log.createdAt,
        type: "OUT",
        qty: log.qty,
        pricePerUnit: log.pricePerUnit || 0,
        totalPrice: log.totalPrice || 0,
        reason: log.reason || "Klinika omboridan olindi",
        note: log.note || "",
        itemId: log.itemId ? {
          _id: log.itemId._id,
          name: log.itemId.name,
          category: String(log.itemId.category || "otherCategory").toLowerCase(),
          unit: log.itemId.unit
        } : null,
        warehouseType: "SHARED"
      });
    });

    // Process personal warehouse logs
    personalLogs.forEach((log) => {
      let rawCat = String(log.itemId?.category || "OTHER").toLowerCase();
      let normalizedCat = "otherCategory";
      if (rawCat === "consumables") normalizedCat = "consumables";
      else if (rawCat === "instruments") normalizedCat = "instruments";
      else if (rawCat === "medicines") normalizedCat = "medicines";

      mergedLogs.push({
        _id: log._id,
        date: log.date || log.createdAt,
        type: "OUT",
        qty: log.qty,
        pricePerUnit: log.pricePerUnit || 0,
        totalPrice: log.totalPrice || 0,
        reason: log.reason || "Shaxsiy ombordan ishlatildi",
        note: log.note || "",
        itemId: log.itemId ? {
          _id: log.itemId._id,
          name: log.itemId.name,
          category: normalizedCat,
          unit: log.itemId.unit
        } : null,
        warehouseType: "PERSONAL"
      });
    });

    // Sort by date descending
    mergedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate totals
    const totalPaid = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalMaterialExpense = mergedLogs.reduce((sum, log) => sum + (log.totalPrice || 0), 0);

    return res.json({
      success: true,
      payouts,
      materialLogs: mergedLogs,
      summary: {
        totalPaid,
        totalMaterialExpense,
        netPayout: totalPaid - totalMaterialExpense,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── Dentist: Update patient info ────────────────────────────────────────────
export const dentistUpdatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.json({ success: false, message: "Bemor topilmadi" });

    const patient = await userModel
      .findById(id)
      .select("patientId image name phone email DOB gender address allergy medicalWarnings note");
    if (!patient) return res.json({ success: false, message: "Bemor topilmadi" });

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
      if (!normalizedName) return res.json({ success: false, message: "Ism majburiy" });
      update.name = normalizedName;
    }

    let normalizedPhone = "";
    if (phone !== undefined) {
      normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) return res.json({ success: false, message: "Telefon noto'g'ri" });
      update.phone = normalizedPhone;
    } else {
      normalizedPhone = patient.phone;
    }

    let emailNormalized = patient.email || "";
    if (email !== undefined) {
      emailNormalized = String(email || "").trim().toLowerCase();
      if (emailNormalized && !validator.isEmail(emailNormalized)) {
        return res.json({ success: false, message: "Email noto'g'ri" });
      }
      update.email = emailNormalized || undefined;
    }

    let normalizedDob = patient.DOB || "";
    if (DOB !== undefined) {
      normalizedDob = String(DOB || "").trim();
      if (!normalizedDob) return res.json({ success: false, message: "Tug'ilgan sana majburiy" });
      update.DOB = normalizedDob;
    }

    if (typeof address === "string") {
      try { address = JSON.parse(address); }
      catch { address = { line1: String(address || "").trim(), line2: "" }; }
    }
    if (address !== undefined) update.address = address || { line1: "", line2: "" };
    if (gender !== undefined) {
      update.gender = ["Erkak", "Ayol", "Tanlanmagan"].includes(gender) ? gender : "Tanlanmagan";
    }
    if (allergy !== undefined) update.allergy = String(allergy || "").trim();
    if (medicalWarnings !== undefined) update.medicalWarnings = String(medicalWarnings || "").trim();
    if (note !== undefined) update.note = String(note || "").trim();

    const duplicate = await findDuplicateBySharedContactAndDob({
      phone: normalizedPhone,
      email: emailNormalized,
      DOB: normalizedDob,
      excludeUserId: patient._id,
    });
    if (duplicate) {
      return res.json({
        success: false,
        message: `Shu telefon yoki email va tug'ilgan sana bilan bemor allaqachon mavjud${duplicate?.patientId ? ` (${duplicate.patientId})` : ""}`,
      });
    }

    const updated = await userModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select("-password +infectiousDiseaseMarkers")
      .lean();

    return res.json({ success: true, message: "Bemor ma'lumotlari yangilandi", patient: updated });
  } catch (error) {
    console.error("dentistUpdatePatient error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DENTIST PERSONAL WAREHOUSE — completely separate from clinic's shared warehouse
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dentist/my-warehouse/items  — list this dentist's own items
export const dentistMyWarehouseItems = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const items = await dentistWarehouseItemModel
      .find({ dentistId, isActive: true })
      .sort({ name: 1 })
      .lean();
    return res.json({ success: true, items });
  } catch (error) {
    console.error("dentistMyWarehouseItems error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/dentist/my-warehouse/items  — add a new personal item
export const dentistMyWarehouseAddItem = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { name, category = "CONSUMABLES", unit = "dona", unitPrice = 0, minQty = 2, initialQty = 0, note = "" } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.json({ success: false, message: "Material nomi majburiy" });
    }

    const item = await dentistWarehouseItemModel.create({
      dentistId,
      name: String(name).trim(),
      category,
      unit: String(unit || "dona").trim(),
      unitPrice: Number(unitPrice) || 0,
      minQty: Number(minQty) || 2,
      quantity: Math.max(0, Number(initialQty) || 0),
      lastStockedAt: Number(initialQty) > 0 ? new Date() : undefined,
    });

    // If initial qty provided, create an IN log
    if (Number(initialQty) > 0) {
      await dentistWarehouseLogModel.create({
        dentistId,
        itemId: item._id,
        type: "IN",
        qty: Number(initialQty),
        pricePerUnit: Number(unitPrice) || 0,
        totalPrice: (Number(unitPrice) || 0) * Number(initialQty),
        reason: note?.trim() || "Boshlang'ich qoldiq kiritildi",
        note: note?.trim() || "",
      });
    }

    return res.json({ success: true, message: "Material qo'shildi", item });
  } catch (error) {
    console.error("dentistMyWarehouseAddItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// PUT /api/dentist/my-warehouse/items/:id  — update item details (price, name, minQty, etc.)
export const dentistMyWarehouseUpdateItem = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { id } = req.params;
    const { name, category, unit, unitPrice, minQty } = req.body || {};

    const item = await dentistWarehouseItemModel.findOne({ _id: id, dentistId });
    if (!item) return res.json({ success: false, message: "Material topilmadi" });

    if (name !== undefined) item.name = String(name).trim();
    if (category !== undefined) item.category = category;
    if (unit !== undefined) item.unit = String(unit).trim();
    if (unitPrice !== undefined) item.unitPrice = Math.max(0, Number(unitPrice) || 0);
    if (minQty !== undefined) item.minQty = Math.max(0, Number(minQty) || 0);

    await item.save();
    return res.json({ success: true, message: "Material yangilandi", item });
  } catch (error) {
    console.error("dentistMyWarehouseUpdateItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// DELETE /api/dentist/my-warehouse/items/:id  — soft-delete
export const dentistMyWarehouseDeleteItem = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { id } = req.params;
    const item = await dentistWarehouseItemModel.findOne({ _id: id, dentistId });
    if (!item) return res.json({ success: false, message: "Material topilmadi" });
    item.isActive = false;
    await item.save();
    return res.json({ success: true, message: "Material o'chirildi" });
  } catch (error) {
    console.error("dentistMyWarehouseDeleteItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/dentist/my-warehouse/items/:id/stock-in  — add stock (purchase/received)
export const dentistMyWarehouseStockIn = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { id } = req.params;
    const { qty, pricePerUnit, reason = "Yangi material sotib olindi", note = "" } = req.body || {};

    const qty_num = Number(qty);
    if (!qty_num || qty_num <= 0) return res.json({ success: false, message: "Miqdor noto'g'ri" });

    const item = await dentistWarehouseItemModel.findOne({ _id: id, dentistId, isActive: true });
    if (!item) return res.json({ success: false, message: "Material topilmadi" });

    const price = pricePerUnit !== undefined ? Math.max(0, Number(pricePerUnit) || 0) : item.unitPrice;
    const total = price * qty_num;

    item.quantity += qty_num;
    item.lastStockedAt = new Date();
    if (pricePerUnit !== undefined && Number(pricePerUnit) > 0) {
      item.unitPrice = price; // update price to latest purchase price
    }
    await item.save();

    const log = await dentistWarehouseLogModel.create({
      dentistId,
      itemId: item._id,
      type: "IN",
      qty: qty_num,
      pricePerUnit: price,
      totalPrice: total,
      reason: String(reason).trim(),
      note: String(note).trim(),
    });

    return res.json({ success: true, message: `+${qty_num} ${item.unit} qo'shildi`, item, log });
  } catch (error) {
    console.error("dentistMyWarehouseStockIn error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/dentist/my-warehouse/items/:id/stock-out  — consume/use stock
export const dentistMyWarehouseStockOut = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { id } = req.params;
    const { qty, reason = "Muolaja uchun sarflandi", note = "" } = req.body || {};

    const qty_num = Number(qty);
    if (!qty_num || qty_num <= 0) return res.json({ success: false, message: "Miqdor noto'g'ri" });

    const item = await dentistWarehouseItemModel.findOne({ _id: id, dentistId, isActive: true });
    if (!item) return res.json({ success: false, message: "Material topilmadi" });
    if (item.quantity < qty_num) {
      return res.json({ success: false, message: `Yetarli qoldiq yo'q. Mavjud: ${item.quantity} ${item.unit}` });
    }

    item.quantity -= qty_num;
    await item.save();

    const log = await dentistWarehouseLogModel.create({
      dentistId,
      itemId: item._id,
      type: "OUT",
      qty: qty_num,
      pricePerUnit: item.unitPrice,
      totalPrice: item.unitPrice * qty_num,
      reason: String(reason).trim(),
      note: String(note).trim(),
    });

    return res.json({ success: true, message: `${qty_num} ${item.unit} sarflandi`, item, log });
  } catch (error) {
    console.error("dentistMyWarehouseStockOut error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/dentist/my-warehouse/logs  — all transactions for this dentist's personal warehouse
export const dentistMyWarehouseLogs = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { limit = 200, type } = req.query;
    const filter = { dentistId };
    if (type === "IN" || type === "OUT") filter.type = type;

    const logs = await dentistWarehouseLogModel
      .find(filter)
      .populate("itemId", "name unit category")
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, logs });
  } catch (error) {
    console.error("dentistMyWarehouseLogs error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ─── GET /api/dentist/appointments/available-slots?date=YYYY-MM-DD ─────────────
// Returns all 30-min slots for the day (08:00-19:30) with BOOKED/FREE status.
// Only slots in the future are marked; past slots are marked PAST.
export const dentistAvailableSlots = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    const { date } = req.query; // expected: "YYYY-MM-DD"
    if (!date) return res.json({ success: false, message: "date parametri kerak" });

    // Generate all 30-min slots: 08:00 to 19:30
    const ALL_SLOTS = [];
    for (let h = 8; h < 20; h++) {
      ALL_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
      ALL_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
    }

    // Fetch booked slotTimes for this dentist on this date
    const booked = await appointmentModel
      .find({
        dentistID: dentistId,
        slotDate: date,
        cancelled: { $ne: true },
      })
      .select("slotTime status")
      .lean();

    const bookedMap = {};
    for (const b of booked) {
      bookedMap[b.slotTime] = b.status || "BOOKED";
    }

    // Build slot list — determine if past
    const nowUTC = Date.now();
    // Parse date parts from YYYY-MM-DD
    const [y, m, d2] = date.split("-").map(Number);

    const slots = ALL_SLOTS.map((time) => {
      const [hh, mm] = time.split(":").map(Number);
      // Use UTC+5 (Tashkent) = UTC + 5 hours
      const slotMs = Date.UTC(y, m - 1, d2, hh - 5, mm, 0); // shift back from local to UTC
      const isPast = slotMs <= nowUTC;
      const status = bookedMap[time]
        ? "BOOKED"
        : isPast
        ? "PAST"
        : "FREE";
      return { time, status };
    });

    return res.json({ success: true, date, slots });
  } catch (error) {
    console.error("dentistAvailableSlots error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const validateDentistSchedulePayload = (schedule) => {
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

export const getDentistMySchedule = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    if (!dentistId) {
      return res.json({ success: false, message: "Shifokor ID topilmadi" });
    }

    const dentist = await dentistModel.findById(dentistId).select("workingSchedule").lean();
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

export const updateDentistMySchedule = async (req, res) => {
  try {
    const dentistId = req.dentistId;
    if (!dentistId) {
      return res.json({ success: false, message: "Shifokor ID topilmadi" });
    }

    const { workingSchedule, isReset } = req.body;

    const dentist = await dentistModel.findById(dentistId);
    if (!dentist) {
      return res.json({ success: false, message: "Shifokor topilmadi" });
    }

    if (isReset) {
      dentist.workingSchedule = undefined;
    } else {
      const cleanSchedule = validateDentistSchedulePayload(workingSchedule);
      if (cleanSchedule.length !== 7) {
        return res.json({ success: false, message: "Haftaning barcha 7 kuni uchun sozlamalar yuborilishi shart" });
      }
      dentist.workingSchedule = cleanSchedule;
    }

    await dentist.save();
    res.json({ success: true, message: "Ish vaqti sozlamalaringiz muvaffaqiyatli saqlandi!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const dentistAddPatientHistoricalTreatment = async (req, res) => {
  try {
    const patientId = req.params?.id || req.body?.patientId || req.body?.userId;
    const {
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

    const finalDentistId = req.dentistId;
    if (!finalDentistId) {
      return res.json({ success: false, message: "Stomatolog aniqlanmadi" });
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
    const paidNow = Math.min(Math.max(0, Number(rawPaid) || 0), amount);

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
      createdFrom: "DENTIST",
      date: dateTimestamp,
      createdAt: dateJs,
      diagnosis: String(diagnosis).trim(),
      treatment: String(procedures).trim(),
      financial: {
        amount,
        paidAmount: 0,
        debt: amount,
        paymentStatus: "UNPAID",
        requestedPaidNow: paidNow,
        requestedPaidNowAt: paidNow > 0 ? new Date() : null,
      },
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

    const dentistPct = Number(dentistDoc.commissionPercent || 30);

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
      paidAmount: 0,
      paymentStatus: "UNPAID",
      payments: [],
      requestedPaidNow: paidNow,
      requestedPaidNowAt: paidNow > 0 ? new Date() : null,
      isHistorical: true,
      lastPaidAt: null,
      createdAt: dateJs,
      amountHistory: [
        {
          action: "INITIAL_SET",
          oldAmount: 0,
          newAmount: amount,
          reason: "Davolash summasi kiritildi",
          changedAt: dateJs,
          changedByRole: "DENTIST",
          changedById: String(req.dentistId || ""),
          changedByName: dentistDoc.name || "Shifokor",
        },
      ],
      commission: {
        percentAtTreatment: dentistPct,
        calculatedShare: 0,
        payoutStatus: "UNPAID",
        payoutId: null,
      },
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
    console.error("dentistAddPatientHistoricalTreatment error:", error);
    return res.json({
      success: false,
      message: error.message || "Eski davolash yozuvini saqlashda xatolik yuz berdi",
    });
  }
};