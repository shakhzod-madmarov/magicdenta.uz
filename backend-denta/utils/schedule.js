import appointmentModel from "../models/appointmentsModel.js";
import appointmentSlotLockModel from "../models/appointmentSlotLockModel.js";
import userModel from "../models/userModel.js";
import clinicSettingsModel from "../models/clinicSettingsModel.js";
import dentistModel from "../models/dentistModel.js";
import {
  addDaysYMD,
  buildNowSlot,
  formatYMD,
  pad2,
  parseUzDateTimeToUtcDate,
  slotDateTimeToUtcMs,
} from "../../shared/date.js";

const SLOT_MINUTES = 60;
const MIN_LEAD_MINUTES = 120;
const LUNCH_BREAKS = [{ from: 12 * 60, to: 13 * 60 }];

const ENFORCE_LUNCH_FOR_STAFF = false;
const ENFORCE_WORK_HOURS_FOR_STAFF = false;

const normalizeTime = (t) => {
  const [h, m] = String(t || "")
    .replace(".", ":")
    .split(":")
    .map((x) => Number(x));

  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  return `${pad2(h)}:${pad2(m)}`;
};

const assertDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ""));
const assertTime = (t) => /^\d{2}:\d{2}$/.test(String(t || ""));

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
};

const nowLocal = () => new Date();

export const getWeekdayIndex = (dateStr) => {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return 1;
  const [year, month, day] = parts;
  const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return d.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

export const getDayConfig = (schedule, dayIndex) => {
  return schedule.find((item) => item.day === dayIndex) || { day: dayIndex, isOpen: false, start: "08:00", end: "18:00" };
};

export const getResolvedScheduleForDentist = async (dentistId) => {
  let schedule = null;
  if (dentistId) {
    const dentist = await dentistModel.findById(dentistId).select("workingSchedule").lean();
    if (dentist && dentist.workingSchedule && dentist.workingSchedule.length > 0) {
      schedule = dentist.workingSchedule;
    }
  }

  if (!schedule) {
    const clinicSettings = await clinicSettingsModel.findOne({ key: "default" }).lean();
    if (clinicSettings && clinicSettings.workingSchedule && clinicSettings.workingSchedule.length > 0) {
      schedule = clinicSettings.workingSchedule;
    }
  }

  if (!schedule) {
    // Default fallback
    schedule = [
      { day: 1, isOpen: true, start: "08:00", end: "18:00" }, // Monday
      { day: 2, isOpen: true, start: "08:00", end: "18:00" },
      { day: 3, isOpen: true, start: "08:00", end: "18:00" },
      { day: 4, isOpen: true, start: "08:00", end: "18:00" },
      { day: 5, isOpen: true, start: "08:00", end: "18:00" },
      { day: 6, isOpen: true, start: "08:00", end: "18:00" }, // Saturday
      { day: 0, isOpen: false, start: "08:00", end: "18:00" } // Sunday
    ];
  }

  return schedule;
};

const isInLunchBreak = (startMinutes) =>
  LUNCH_BREAKS.some((b) => startMinutes >= b.from && startMinutes < b.to);

export const createAppointmentSafe = async ({
  userId,
  dentistID,
  slotDate,
  slotTime,
  userData,
  dentistData,
  createdFrom = "USER",
}) => {
  if (!userId || !dentistID || !slotDate || !slotTime) {
    throw new Error("Maʼlumotlar yetarli emas");
  }

  const normalizedDate = String(slotDate);
  const normalizedTime = normalizeTime(slotTime);

  if (!assertDate(normalizedDate)) throw new Error("Sana noto‘g‘ri formatda");
  if (!assertTime(normalizedTime)) throw new Error("Vaqt noto‘g‘ri formatda");

  const startMinutes = timeToMinutes(normalizedTime);
  const isStaff = createdFrom === "DENTIST" || createdFrom === "ADMIN";

  const now = nowLocal();
  const appDateTime = parseUzDateTimeToUtcDate(normalizedDate, normalizedTime);

  if (!appDateTime || Number.isNaN(appDateTime.getTime())) {
    throw new Error("Sana yoki vaqt noto‘g‘ri");
  }

  if (appDateTime.getTime() <= now.getTime()) {
    throw new Error(
      "O‘tgan vaqtga uchrashuv yaratib bo‘lmaydi. Iltimos, kelajakdagi vaqtni tanlang.",
    );
  }

  const existing = await appointmentModel
    .findOne({
      dentistID,
      slotDate: normalizedDate,
      slotTime: normalizedTime,
      cancelled: false,
    })
    .select("_id")
    .lean();

  if (existing) {
    throw new Error("Bu vaqt band. Iltimos, boshqa vaqt tanlang.");
  }

  const schedule = await getResolvedScheduleForDentist(dentistID);
  const dayIndex = getWeekdayIndex(normalizedDate);
  const dayConfig = getDayConfig(schedule, dayIndex);

  const prevDayIndex = (dayIndex + 6) % 7;
  const prevDayConfig = getDayConfig(schedule, prevDayIndex);

  let isAllowed = false;

  // Check current day's shift
  if (dayConfig.isOpen) {
    const startMins = timeToMinutes(dayConfig.start);
    const endMins = timeToMinutes(dayConfig.end);

    if (startMins < endMins) {
      if (startMinutes >= startMins && startMinutes + SLOT_MINUTES <= endMins) {
        isAllowed = true;
      }
    } else {
      // Overnight
      if (startMinutes >= startMins) {
        isAllowed = true;
      }
    }
  }

  // Check previous day's overnight shift
  if (!isAllowed && prevDayConfig.isOpen) {
    const prevStartMins = timeToMinutes(prevDayConfig.start);
    const prevEndMins = timeToMinutes(prevDayConfig.end);

    if (prevStartMins > prevEndMins) {
      if (startMinutes + SLOT_MINUTES <= prevEndMins) {
        isAllowed = true;
      }
    }
  }

  if (!isStaff) {
    if (!isAllowed) {
      throw new Error(
        "Klinika yoki shifokor ushbu kunda ishlamaydi. Iltimos, boshqa kunni tanlang."
      );
    }

    if (isInLunchBreak(startMinutes)) {
      throw new Error(
        "Bu vaqtda klinika tushlikda, iltimos boshqa vaqt tanlang",
      );
    }

    if (appDateTime.getTime() - now.getTime() < MIN_LEAD_MINUTES * 60 * 1000) {
      throw new Error(
        `Uchrashuvni kamida ${MIN_LEAD_MINUTES / 60} soat oldin band qilish mumkin`,
      );
    }
  }

  if (isStaff) {
    if (ENFORCE_WORK_HOURS_FOR_STAFF) {
      if (!isAllowed) {
        throw new Error("Ushbu kunda ish jadvali yopiq.");
      }
    }

    if (ENFORCE_LUNCH_FOR_STAFF && isInLunchBreak(startMinutes)) {
      throw new Error(
        "Bu vaqtda klinika tushlikda, iltimos boshqa vaqt tanlang",
      );
    }
  }

  const bookingKey = `${dentistID}_${normalizedDate}_${normalizedTime}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  let lockDoc;
  try {
    lockDoc = await appointmentSlotLockModel.create({
      dentistID,
      slotDate: normalizedDate,
      slotTime: normalizedTime,
      bookingKey,
    });
  } catch (e) {
    if (String(e?.message || "").includes("E11000")) {
      throw new Error("Bu vaqt band. Iltimos, boshqa vaqt tanlang.");
    }
    throw e;
  }

  try {
    const appointment = await appointmentModel.create({
      userId,
      dentistID,
      slotDate: normalizedDate,
      slotTime: normalizedTime,
      durationMinutes: SLOT_MINUTES,
      cancelled: false,
      isDone: false,
      isMissed: false,
      createdFrom,
      date: appDateTime.getTime(),
    });

    await appointmentSlotLockModel.updateOne(
      { _id: lockDoc._id },
      { $set: { appointmentId: appointment._id } },
    );

    const obj = appointment.toObject();
    if (userData) obj.userData = userData;
    if (dentistData) obj.dentistData = dentistData;

    return obj;
  } catch (e) {
    if (lockDoc?._id) {
      await appointmentSlotLockModel.deleteOne({ _id: lockDoc._id });
    }
    throw e;
  }
};

export const releaseLocksByAppointment = async (appointmentId) => {
  if (!appointmentId) return;
  await appointmentSlotLockModel.deleteMany({ appointmentId });
};

export const getAvailabilityForDentist = async ({
  dentistID,
  startDate,
  days = 7,
  enforceLeadTime = true,
}) => {
  if (!dentistID) throw new Error("Stomatolog ID kerak");

  const now = nowLocal();
  const startYMD =
    startDate && assertDate(startDate) ? startDate : formatYMD(now);

  const dayStrings = Array.from({ length: days }, (_, i) =>
    addDaysYMD(startYMD, i),
  ).filter(Boolean);

  const [locks, apps] = await Promise.all([
    appointmentSlotLockModel
      .find({ dentistID, slotDate: { $in: dayStrings } })
      .lean(),
    appointmentModel
      .find({ dentistID, slotDate: { $in: dayStrings }, cancelled: false })
      .lean(),
  ]);

  const busySet = new Set();
  for (const l of locks) busySet.add(`${l.slotDate}T${l.slotTime}`);
  for (const a of apps) busySet.add(`${a.slotDate}T${a.slotTime}`);

  const schedule = await getResolvedScheduleForDentist(dentistID);
  const nowSlot = buildNowSlot();
  const nowMs = slotDateTimeToUtcMs(nowSlot.slotDate, nowSlot.slotTime, 0);

  return dayStrings.map((dateStr) => {
    const slots = [];
    const dayIndex = getWeekdayIndex(dateStr);
    const dayConfig = getDayConfig(schedule, dayIndex);

    const prevDayIndex = (dayIndex + 6) % 7;
    const prevDayConfig = getDayConfig(schedule, prevDayIndex);

    for (let mins = 0; mins + SLOT_MINUTES <= 24 * 60; mins += SLOT_MINUTES) {
      let isAllowed = false;

      // Check current day's shift
      if (dayConfig.isOpen) {
        const startMins = timeToMinutes(dayConfig.start);
        const endMins = timeToMinutes(dayConfig.end);

        if (startMins < endMins) {
          if (mins >= startMins && mins + SLOT_MINUTES <= endMins) {
            isAllowed = true;
          }
        } else {
          // Overnight
          if (mins >= startMins) {
            isAllowed = true;
          }
        }
      }

      // Check previous day's overnight shift
      if (!isAllowed && prevDayConfig.isOpen) {
        const prevStartMins = timeToMinutes(prevDayConfig.start);
        const prevEndMins = timeToMinutes(prevDayConfig.end);

        if (prevStartMins > prevEndMins) {
          if (mins + SLOT_MINUTES <= prevEndMins) {
            isAllowed = true;
          }
        }
      }

      if (!isAllowed) continue;
      if (isInLunchBreak(mins)) continue;

      const timeStr = minutesToTime(mins);
      const key = `${dateStr}T${timeStr}`;
      const slotMs = slotDateTimeToUtcMs(dateStr, timeStr, 0);

      const isPast = slotMs <= nowMs;
      const isTooSoon = slotMs - nowMs < MIN_LEAD_MINUTES * 60 * 1000;

      const available =
        !busySet.has(key) &&
        (!enforceLeadTime || (!isPast && !isTooSoon));

      slots.push({
        time: timeStr,
        available,
      });
    }

    return {
      date: dateStr,
      weekdayClosed: slots.length === 0 && !dayConfig.isOpen,
      slots,
    };
  });
};

export const getDetailedScheduleForDentist = async ({ dentistID, startDate, days = 7 }) => {
  if (!dentistID) throw new Error("Stomatolog ID kerak");

  const now = nowLocal();
  const startYMD = startDate && assertDate(startDate) ? startDate : formatYMD(now);

  const dayStrings = Array.from({ length: days }, (_, i) =>
    addDaysYMD(startYMD, i)
  ).filter(Boolean);

  const [locks, apps, todayApps] = await Promise.all([
    appointmentSlotLockModel.find({ dentistID, slotDate: { $in: dayStrings } }).lean(),
    appointmentModel.find({ 
      dentistID, 
      slotDate: { $in: dayStrings },
      cancelled: false 
    }).populate("userId", "name phone patientId").lean(),
    appointmentModel.find({
      dentistID,
      slotDate: formatYMD(now),
      cancelled: false,
    }).populate("userId", "name phone patientId").lean()
  ]);

  const occupiedMap = {};
  for (const a of apps) {
    const key = `${a.slotDate}T${a.slotTime}`;
    occupiedMap[key] = {
      appointmentId: a._id,
      status: a.status,
      isWalkIn: a.isWalkIn,
      createdByName: a.createdByName || "",
      createdByRole: a.createdByRole || "",
      patient: {
        name: a.userId?.name || "Bemor",
        phone: a.userId?.phone || "Telefon yo'q",
        patientId: a.userId?.patientId || "",
      }
    };
  }

  const lockSet = new Set();
  for (const l of locks) lockSet.add(`${l.slotDate}T${l.slotTime}`);

  const schedule = await getResolvedScheduleForDentist(dentistID);

  const availability = dayStrings.map((dateStr) => {
    const slots = [];
    const dayIndex = getWeekdayIndex(dateStr);
    const dayConfig = getDayConfig(schedule, dayIndex);

    const prevDayIndex = (dayIndex + 6) % 7;
    const prevDayConfig = getDayConfig(schedule, prevDayIndex);

    for (let h = 0; h < 24; h++) {
      const times = [
        `${String(h).padStart(2, "0")}:00`,
        `${String(h).padStart(2, "0")}:30`
      ];

      for (const timeStr of times) {
        const timeMins = h * 60 + (timeStr.endsWith(":30") ? 30 : 0);
        let isAllowed = false;

        // Current day's shift
        if (dayConfig.isOpen) {
          const startMins = timeToMinutes(dayConfig.start);
          const endMins = timeToMinutes(dayConfig.end);

          if (startMins < endMins) {
            if (timeMins >= startMins && timeMins + 30 <= endMins) {
              isAllowed = true;
            }
          } else {
            // Overnight
            if (timeMins >= startMins) {
              isAllowed = true;
            }
          }
        }

        // Previous day's overnight shift
        if (!isAllowed && prevDayConfig.isOpen) {
          const prevStartMins = timeToMinutes(prevDayConfig.start);
          const prevEndMins = timeToMinutes(prevDayConfig.end);

          if (prevStartMins > prevEndMins) {
            if (timeMins + 30 <= prevEndMins) {
              isAllowed = true;
            }
          }
        }

        if (!isAllowed) continue;

        const key = `${dateStr}T${timeStr}`;
        const occ = occupiedMap[key];
        const isLocked = lockSet.has(key);
        
        slots.push({
          time: timeStr,
          available: !occ && !isLocked,
          isLocked,
          appointment: occ || null
        });
      }
    }

    return {
      date: dateStr,
      weekdayClosed: slots.length === 0,
      slots
    };
  });

  const nowMs = Date.now();
  const waitingPatients = todayApps
    .filter((a) => a.status === "WAITING")
    .map((a) => {
      let waitMinutes = 0;
      if (a.isWalkIn) {
        waitMinutes = Math.max(0, Math.floor((nowMs - new Date(a.createdAt).getTime()) / 60000));
      } else {
        const slotTimeMs = slotDateTimeToUtcMs(a.slotDate, a.slotTime || "08:00", nowMs);
        waitMinutes = Math.max(0, Math.floor((nowMs - slotTimeMs) / 60000));
      }
      return {
        appointmentId: a._id,
        name: a.userId?.name || "Bemor",
        phone: a.userId?.phone || "",
        patientId: a.userId?.patientId || "",
        isWalkIn: a.isWalkIn,
        slotTime: a.slotTime,
        waitMinutes,
        createdAt: a.createdAt
      };
    });

  const longestWaitMinutes = waitingPatients.length > 0 
    ? Math.max(...waitingPatients.map(p => p.waitMinutes)) 
    : 0;

  return {
    availability,
    liveQueue: {
      waitingCount: waitingPatients.length,
      longestWaitMinutes,
      activePatients: waitingPatients
    }
  };
};

export const rescheduleAppointmentSafe = async ({
  appointmentId,
  newSlotDate,
  newSlotTime,
  rescheduledBy = "ADMIN",
  rescheduledByName = "",
  reason = "",
  newDentistID = null,
}) => {
  if (!appointmentId || !newSlotDate || !newSlotTime) {
    throw new Error("Maʼlumotlar yetarli emas");
  }

  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    throw new Error("Uchrashuv topilmadi");
  }

  if (appointment.cancelled || appointment.status === "CANCELLED") {
    throw new Error("Bekor qilingan uchrashuv vaqtini ko'chirish mumkin emas");
  }

  if (appointment.status === "DONE" || appointment.status === "IN_PROGRESS") {
    throw new Error("Boshlangan yoki yakunlangan uchrashuv vaqtini ko'chirish mumkin emas");
  }

  const normalizedDate = String(newSlotDate);
  const normalizedTime = normalizeTime(newSlotTime);

  if (!assertDate(normalizedDate)) throw new Error("Sana noto‘g‘ri formatda");
  if (!assertTime(normalizedTime)) throw new Error("Vaqt noto‘g‘ri formatda");

  const targetDentistID = newDentistID || appointment.dentistID;

  if (
    String(appointment.dentistID) === String(targetDentistID) &&
    appointment.slotDate === normalizedDate &&
    appointment.slotTime === normalizedTime
  ) {
    throw new Error("Uchrashuv allaqachon ushbu vaqtga belgilangan");
  }

  const appDateTime = parseUzDateTimeToUtcDate(normalizedDate, normalizedTime);
  if (!appDateTime || Number.isNaN(appDateTime.getTime())) {
    throw new Error("Sana yoki vaqt noto‘g‘ri");
  }

  const now = nowLocal();
  if (appDateTime.getTime() <= now.getTime()) {
    throw new Error("O‘tgan vaqtga uchrashuvni ko'chirib bo‘lmaydi. Kelajakdagi vaqtni tanlang.");
  }

  const existing = await appointmentModel
    .findOne({
      _id: { $ne: appointment._id },
      dentistID: targetDentistID,
      slotDate: normalizedDate,
      slotTime: normalizedTime,
      cancelled: false,
    })
    .select("_id")
    .lean();

  if (existing) {
    throw new Error("Bu vaqt band. Iltimos, boshqa vaqt tanlang.");
  }

  // Release old locks
  await releaseLocksByAppointment(appointment._id);

  // Clear old dentist slot if set
  const oldDentistDoc = await dentistModel.findById(appointment.dentistID);
  if (oldDentistDoc?.slots_booked?.[appointment.slotDate]) {
    oldDentistDoc.slots_booked[appointment.slotDate] = oldDentistDoc.slots_booked[
      appointment.slotDate
    ].filter((t) => t !== appointment.slotTime);
    if (!oldDentistDoc.slots_booked[appointment.slotDate].length) {
      delete oldDentistDoc.slots_booked[appointment.slotDate];
    }
    oldDentistDoc.markModified("slots_booked");
    await oldDentistDoc.save();
  }

  // Create new slot lock
  const bookingKey = `${targetDentistID}_${normalizedDate}_${normalizedTime}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  let lockDoc;
  try {
    lockDoc = await appointmentSlotLockModel.create({
      dentistID: targetDentistID,
      slotDate: normalizedDate,
      slotTime: normalizedTime,
      appointmentId: appointment._id,
      bookingKey,
    });
  } catch (e) {
    if (String(e?.message || "").includes("E11000")) {
      throw new Error("Bu vaqt band. Iltimos, boshqa vaqt tanlang.");
    }
    throw e;
  }

  const oldSlotDate = appointment.slotDate;
  const oldSlotTime = appointment.slotTime;

  appointment.slotDate = normalizedDate;
  appointment.slotTime = normalizedTime;
  appointment.dentistID = targetDentistID;
  appointment.date = appDateTime.getTime();
  appointment.rescheduled = true;
  appointment.rescheduledBy = rescheduledBy;
  appointment.rescheduledByName = rescheduledByName || rescheduledBy;
  appointment.rescheduledAt = Date.now();

  if (!Array.isArray(appointment.rescheduleHistory)) {
    appointment.rescheduleHistory = [];
  }

  appointment.rescheduleHistory.push({
    oldSlotDate,
    oldSlotTime,
    newSlotDate: normalizedDate,
    newSlotTime: normalizedTime,
    rescheduledBy,
    rescheduledByName: rescheduledByName || rescheduledBy,
    rescheduledAt: Date.now(),
    reason: reason || "",
  });

  await appointment.save();

  const populated = await appointmentModel
    .findById(appointment._id)
    .populate("userId", "name phone patientId")
    .populate("dentistID", "name image")
    .lean();

  return populated;
};
