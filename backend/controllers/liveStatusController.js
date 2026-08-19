import dentistModel from "../models/dentistModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import { buildLooseTextForms, normalizeText } from "../utils/text.js";
import {
  buildNowSlot,
  isoToday,
  parseUzDateTimeToUtcDate,
} from "../../shared/date.js";

import {
  nowSlotDateTime,
  setBusy,
  setAvailable,
  getDentistComputedStatus,
  expireWalkInAppointments,
} from "../utils/liveDentistStatus.js";

import { normalizePhone } from "../utils/phone.js";
import {
  attachAppointmentToUnifiedOrthodontistQueue,
  resolveOrthodontistDentist,
} from "../utils/orthodontistQueueService.js";

const safeStr = (v) => String(v ?? "").trim();

const getOrCreatePatient = async ({ userId, patientId, phone, name }) => {
  if (userId) {
    const u = await userModel.findById(userId);
    if (!u) throw new Error("Bemor topilmadi");
    return u;
  }

  if (patientId) {
    const u = await userModel.findOne({ patientId: safeStr(patientId) });
    if (!u) throw new Error("Bemor topilmadi");
    return u;
  }

  if (phone) {
    const np = normalizePhone(phone);
    if (np) {
      const matches = await userModel
        .find({ phone: np })
        .sort({ createdAt: 1, _id: 1 });

      if (matches.length === 1) return matches[0];

      if (matches.length > 1) {
        const byName = matches.filter((u) =>
          userModel.isPatientNameEquivalent(u.name, name),
        );

        if (byName.length === 1) return byName[0];

        throw new Error(
          "Bu telefon raqam bilan bir nechta bemor mavjud. Iltimos, Bemor ID yoki ism orqali aniq tanlang.",
        );
      }
    }
  }

  throw new Error(
    "Bemor topilmadi. Shu joyning o‘zida yangi bemor yaratib qayta urinib ko‘ring.",
  );
};

const ensureNoRecentActiveAppointment = async (patientId) => {
  const now = Date.now();
  const THIRTY_MS = 30 * 60 * 1000;

  const exists = await appointmentModel
    .findOne({
      userId: patientId,
      cancelled: false,
      status: { $in: ["WAITING", "IN_PROGRESS"] },
      date: { $gte: now - THIRTY_MS, $lte: now + THIRTY_MS },
    })
    .select("_id dentistID status slotDate slotTime isWalkIn")
    .lean();

  if (exists) {
    return {
      ok: false,
      message:
        "Bu bemor allaqachon qabulda yoki navbatda. Iltimos, biroz kuting.",
    };
  }

  return { ok: true };
};

export const adminAssignWalkIn = async (req, res) => {
  try {
    const body = req.body || {};
    const dentistID = body.dentistID || body.dentistId;
    const {
      userId,
      name,
      phone,
      patientId,
      note = "",
      force = false,
      forceChange = false,
    } = body;

    if (!dentistID) {
      return res.json({ success: false, message: "dentistID kerak" });
    }

    const dentist = await dentistModel.findById(dentistID).lean();
    if (!dentist) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    if (dentist.isArchived) {
      return res.json({
        success: false,
        message: "Arxivdagi stomatologga jonli yuborib bo‘lmaydi",
      });
    }

    await expireWalkInAppointments();

    const status = await getDentistComputedStatus(dentistID);

    if (status.state === "BUSY" && !force) {
      return res.json({
        success: false,
        message: "Stomatolog band. Majburan yuborish mumkin.",
      });
    }

    const patient = await getOrCreatePatient({
      userId,
      name,
      phone,
      patientId,
    });

    const rawType = String(req.body?.appointmentType || "").toUpperCase();
    const isOrtho = rawType === "ORTHODONTIC" || req.body?.isOrtho === true;
    const appointmentType = isOrtho ? "ORTHODONTIC" : "NORMAL";

    const chk = await ensureNoRecentActiveAppointment(patient._id);
    if (!chk.ok) return res.json({ success: false, message: chk.message });

    const now = nowSlotDateTime();

    const todayAppointment = await appointmentModel
      .findOne({
        userId: patient._id,
        slotDate: now.slotDate,
        cancelled: false,
        status: { $in: ["WAITING", "IN_PROGRESS"] },
      })
      .populate("dentistID", "name")
      .lean();

    if (todayAppointment) {
      if (String(todayAppointment.dentistID._id) === String(dentistID)) {
        return res.json({
          success: false,
          message: "Bemor allaqachon shu stomatolog navbatida.",
        });
      }

      if (!forceChange) {
        return res.json({
          success: false,
          code: "HAS_TODAY_APPOINTMENT",
          message: "Bemor bugun boshqa stomatologga yozilgan.",
          existing: {
            appointmentId: todayAppointment._id,
            dentistName: todayAppointment.dentistID?.name || "",
            slotTime: todayAppointment.slotTime,
          },
        });
      }

      const appointment = await appointmentModel.findById(todayAppointment._id);

      const { releaseLocksByAppointment } =
        await import("../utils/schedule.js");
      await releaseLocksByAppointment(appointment._id);

      appointment.dentistID = dentistID;
      appointment.slotDate = now.slotDate;
      appointment.slotTime = now.slotTime;
      appointment.date = now.dateMs;
      appointment.isWalkIn = true;
      appointment.appointmentType = appointmentType;
      appointment.walkInNote = String(note || "");
      appointment.status = "WAITING";
      appointment.cancelled = false;
      appointment.startedAt = null;

      await appointment.save();

      if (isOrtho) {
        try {
          await attachAppointmentToUnifiedOrthodontistQueue({
            appointment,
            source: "ADMIN_WALKIN",
            firstVisit: false,
          });
        } catch (e) {
          console.error("QUEUE ATTACH ERROR (admin forceChange walkin):", e);
        }
      }

      if (!isOrtho) {
        try {
          const { notifyDentistAboutPatientArrival } = await import("../utils/telegramBot.js");
          await notifyDentistAboutPatientArrival({
            dentistId: appointment.dentistID,
            patientName: patient.name,
            queueNo: "",
            isWalkIn: true,
            appointmentType,
            slotTime: appointment.slotTime,
            note: appointment.walkInNote,
          });
        } catch (err) {
          console.warn("[adminAssignWalkIn relocate] Dentist Telegram notify failed:", err.message);
        }
      }

      return res.json({
        success: true,
        message: "Uchrashuv boshqa stomatologga ko‘chirildi.",
        appointmentId: appointment._id,
        changed: true,
      });
    }

    const appointment = await appointmentModel.create({
      userId: patient._id,
      dentistID,
      slotDate: now.slotDate,
      slotTime: now.slotTime,
      date: now.dateMs,
      createdFrom: "ADMIN",
      isWalkIn: true,
      appointmentType,
      walkInNote: String(note || ""),
      status: "WAITING",
      cancelled: false,
      startedAt: null,
    });

    if (isOrtho) {
      try {
        await attachAppointmentToUnifiedOrthodontistQueue({
          appointment,
          source: "ADMIN_WALKIN",
          firstVisit: false,
        });
      } catch (e) {
        console.error("QUEUE ATTACH ERROR (admin walkin):", e);
      }
    }

    // Notify dentist about new arrived walk-in patient (only for non-ortho checkup)
    if (!isOrtho) {
      try {
        const { notifyDentistAboutPatientArrival } = await import("../utils/telegramBot.js");
        await notifyDentistAboutPatientArrival({
          dentistId: appointment.dentistID,
          patientName: patient.name,
          queueNo: "",
          isWalkIn: true,
          slotTime: appointment.slotTime,
          note: appointment.walkInNote,
        });
      } catch (err) {
        console.warn("[adminAssignWalkIn] Dentist Telegram notify failed:", err.message);
      }
    }

    return res.json({
      success: true,
      message: "Jonli yuborildi. Stomatolog tasdiqlamaguncha band bo‘lmaydi.",
      appointmentId: appointment._id,
    });
  } catch (e) {
    return res.json({ success: false, message: e.message || "Xatolik" });
  }
};

export const adminGetDentistsLiveStatus = async (_req, res) => {
  try {
    await expireWalkInAppointments();

    const dentists = await dentistModel
      .find({ isArchived: { $ne: true } })
      .select("_id name dentistId phone email image speciality available")
      .lean();

    const result = [];
    for (const d of dentists) {
      const st = await getDentistComputedStatus(d._id);
      result.push({ dentist: d, work: st });
    }

    return res.json({ success: true, dentists: result });
  } catch (e) {
    return res.json({ success: false, message: e.message || "Xatolik" });
  }
};

export const dentistFinishCurrent = async (req, res) => {
  try {
    const dentistID = req.dentistId;
    const { appointmentId } = req.body || {};

    if (appointmentId) {
      await appointmentModel.updateOne(
        { _id: appointmentId, dentistID, cancelled: false },
        { $set: { status: "DONE" } },
      );
    }

    await setAvailable(dentistID);
    return res.json({ success: true, message: "Stomatolog BO‘SH bo‘ldi" });
  } catch (e) {
    return res.json({ success: false, message: e.message || "Xatolik" });
  }
};

export const dentistGetMyWorkStatus = async (req, res) => {
  await expireWalkInAppointments();
  const st = await getDentistComputedStatus(req.dentistId);
  return res.json({ success: true, status: st });
};

export const adminLookupPatient = async (req, res) => {
  try {
    const { phone, patientId, name, q } = req.query || {};

    if (q) {
      const qq = safeStr(q);
      const np = normalizePhone(qq);

      if (np) {
  const patientsByPhone = await userModel
    .find({ phone: np })
    .sort({ createdAt: 1, _id: 1 })
    .limit(10)
    .lean();

  if (patientsByPhone.length === 1) {
    return res.json({ success: true, patient: patientsByPhone[0] });
  }

  if (patientsByPhone.length > 1) {
    return res.json({ success: true, patients: patientsByPhone });
  }
}

      const byPid = await userModel.findOne({ patientId: qq }).lean();
      if (byPid) return res.json({ success: true, patient: byPid });

      const orConditions = [{ name: { $regex: qq, $options: "i" } }];

      for (const form of buildLooseTextForms(qq)) {
        orConditions.push({ nameNormalized: { $regex: form } });
      }

      const patients = await userModel
        .find({ $or: orConditions })
        .limit(5)
        .lean();

      if (!patients.length)
        return res.json({ success: false, code: "NOT_FOUND" });
      return res.json({ success: true, patients });
    }

    if (phone) {
  const p = normalizePhone(phone);
  if (!p) return res.json({ success: false, code: "INVALID_PHONE" });

  const patients = await userModel
    .find({ phone: p })
    .sort({ createdAt: 1, _id: 1 })
    .limit(10)
    .lean();

  if (!patients.length)
    return res.json({ success: false, code: "NOT_FOUND_PHONE" });

  if (patients.length === 1) {
    return res.json({ success: true, patient: patients[0] });
  }

  return res.json({ success: true, patients });
}

    if (patientId) {
      const patient = await userModel
        .findOne({ patientId: safeStr(patientId) })
        .lean();

      if (!patient)
        return res.json({ success: false, code: "NOT_FOUND_PATIENT_ID" });

      return res.json({ success: true, patient });
    }

    if (name) {
      const orConditions = [{ name: { $regex: name, $options: "i" } }];

      for (const form of buildLooseTextForms(name)) {
        orConditions.push({ nameNormalized: { $regex: form } });
      }

      const patients = await userModel
        .find({ $or: orConditions })
        .limit(5)
        .lean();

      if (!patients.length)
        return res.json({ success: false, code: "NOT_FOUND" });
      return res.json({ success: true, patients });
    }

    return res.json({ success: false, code: "EMPTY_QUERY" });
  } catch (_e) {
    return res.status(500).json({ success: false, code: "SERVER_ERROR" });
  }
};

const roundTo5MinMs = (ms) => {
  const d = new Date(ms);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  d.setMinutes(m - (m % 5));
  return d.getTime();
};

const msToSlot = (ms) => {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return {
    slotDate: `${yyyy}-${mm}-${dd}`,
    slotTime: `${hh}:${mi}`,
    dateMs: ms,
  };
};

const slotToMsSafe = (slotDate, slotTime, fallback = 0) => {
  const dt = parseUzDateTimeToUtcDate(slotDate, slotTime);
  return dt instanceof Date && !Number.isNaN(dt.getTime())
    ? dt.getTime()
    : fallback;
};

const findNextFreeSlot = async (dentistID, desiredMs) => {
  let ms = roundTo5MinMs(desiredMs);

  for (let i = 0; i < 24; i++) {
    const s = msToSlot(ms);
    const clash = await appointmentModel
      .findOne({
        dentistID,
        slotDate: s.slotDate,
        slotTime: s.slotTime,
        cancelled: false,
        status: { $in: ["WAITING", "IN_PROGRESS"] },
      })
      .select("_id")
      .lean();

    if (!clash) return { ...s, ms };

    ms += 5 * 60 * 1000;
  }

  const fallback = msToSlot(ms);
  return { ...fallback, ms };
};

export const dentistAssignWalkIn = async (req, res) => {
  try {
    const dentistID = req.dentistId;

    const body = req.body || {};
    const { userId, name, phone, patientId, note = "" } = body;

    if (!dentistID) {
      return res.json({ success: false, message: "dentistID topilmadi" });
    }

    const dentist = await dentistModel.findById(dentistID).lean();
    if (!dentist) {
      return res.json({ success: false, message: "Stomatolog topilmadi" });
    }

    await expireWalkInAppointments();

    const status = await getDentistComputedStatus(dentistID);

    const patient = await getOrCreatePatient({
      userId,
      name,
      phone,
      patientId,
    });

    const chk = await ensureNoRecentActiveAppointment(patient._id);
    if (!chk.ok) return res.json({ success: false, message: chk.message });

    const now = nowSlotDateTime();
    const nowMs = now.dateMs;

    const nextWaiting = await appointmentModel
      .findOne({ dentistID, cancelled: false, status: "WAITING" })
      .sort({ slotDate: 1, slotTime: 1, createdAt: 1 })
      .select("_id slotDate slotTime date isWalkIn createdAt")
      .lean();

    let desiredMs = nowMs;
    let placedAfter = null;

    if (status.state === "BUSY" && nextWaiting) {
      const nextMs = slotToMsSafe(
        nextWaiting.slotDate,
        nextWaiting.slotTime,
        nextWaiting.date,
      );
      const minutesLeft = Math.max(0, Math.ceil((nextMs - nowMs) / 60000));

      if (minutesLeft <= 60) {
        desiredMs = Math.max(nowMs, nextMs) + 15 * 60 * 1000;
        placedAfter = nextWaiting._id;
      }
    }

    if (status.state === "BUSY" && !nextWaiting) {
      desiredMs = nowMs + 15 * 60 * 1000;
    }

    const chosen = await findNextFreeSlot(dentistID, desiredMs);

    const withinWalkInWindow = chosen.ms <= nowMs + 60 * 60 * 1000;
    const isWalkIn = withinWalkInWindow;

    const rawType = String(req.body?.appointmentType || "").toUpperCase();
    const isOrtho = rawType === "ORTHODONTIC" || req.body?.isOrtho === true;
    const appointmentType = isOrtho ? "ORTHODONTIC" : "NORMAL";

    const appointment = await appointmentModel.create({
      userId: patient._id,
      dentistID,
      slotDate: chosen.slotDate,
      slotTime: chosen.slotTime,
      date: chosen.ms,
      createdFrom: "DENTIST",
      isWalkIn,
      appointmentType,
      walkInNote: String(note || ""),
      status: "WAITING",
      cancelled: false,
      startedAt: null,
    });

    if (isOrtho) {
      try {
        await attachAppointmentToUnifiedOrthodontistQueue({
          appointment,
          source: "DENTIST_WALKIN",
          firstVisit: false,
        });
      } catch (e) {
        console.error("QUEUE ATTACH ERROR (dentist walkin):", e);
      }
    }

    const whenText = `${chosen.slotDate} ${chosen.slotTime}`;

    // Notify dentist about new arrived walk-in patient (only for non-ortho checkup)
    if (!isOrtho) {
      try {
        const { notifyDentistAboutPatientArrival } = await import("../utils/telegramBot.js");
        await notifyDentistAboutPatientArrival({
          dentistId: appointment.dentistID,
          patientName: patient.name,
          queueNo: "",
          isWalkIn,
          appointmentType,
          slotTime: appointment.slotTime,
          note: appointment.walkInNote,
        });
      } catch (err) {
        console.warn("[dentistAssignWalkIn] Dentist Telegram notify failed:", err.message);
      }
    }

    if (status.state === "BUSY" && placedAfter) {
      return res.json({
        success: true,
        message:
          "Stomatolog band. Navbatda bemor bor — yangi bemor undan keyin qo‘shildi.",
        appointmentId: appointment._id,
        scheduledAt: whenText,
        isWalkIn,
      });
    }

    return res.json({
      success: true,
      message: isWalkIn
        ? "Jonli qo‘shildi."
        : "Bemor navbatga qo‘shildi (60 daqiqadan keyin bo‘lgani uchun Jonli qo‘shilmadi).",
      appointmentId: appointment._id,
      scheduledAt: whenText,
      isWalkIn,
    });
  } catch (e) {
    return res.json({ success: false, message: e.message || "Xatolik" });
  }
};

export const dentistLookupPatient = async (req, res) => {
  return adminLookupPatient(req, res);
};
