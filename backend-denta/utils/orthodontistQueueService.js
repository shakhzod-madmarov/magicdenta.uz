import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dentistModel from "../models/dentistModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";
import orthodontistFollowUpReminderLogModel from "../models/orthodontistFollowUpReminderLogModel.js";
import {
  addDaysYMD,
  isoToday,
  parseUzDateTimeToUtcDate,
  formatUzDayKey,
} from "../../shared/date.js";
import {
  buildAppointmentsButton,
  buildOrthodontistFollowUpCompletionMessage,
} from "./telegramMessageBuilders.js";
import { sendTelegramMessage } from "./telegramBot.js";
import {
  prepareImageForJpegStorage,
  writePreparedImageToFile,
} from "./sanitizeImage.js";
import { getClinicCoordinates, haversineMeters } from "./geo.js";
import { nowSlotDateTime, setBusy, setAvailable } from "./liveDentistStatus.js";
import {
  buildPatientXrayFileName,
  ensureDir,
  safeFilenamePart,
  safeRelPath,
} from "./files.js";

const ACTIVE_STATUSES = ["WAITING", "CALLED", "IN_PROGRESS"];
const TERMINAL_STATUSES = ["DONE", "MISSED", "CANCELLED"];
const orthoRegex = /ortodont|orthodont/i;

const ORTHO_WALKIN_NOTE = "ORTHODONTIST_QUEUE";
const ORTHO_FIRST_VISIT_NOTE = "ORTHODONTIST_FIRST_VISIT";

const QUEUE_SOURCES = {
  TELEGRAM: "TELEGRAM",
  ONLINE: "ONLINE",
  ADMIN_WALKIN: "ADMIN_WALKIN",
  DENTIST_WALKIN: "DENTIST_WALKIN",
};

const normalizeAppointmentQueueStatus = (appointment) => {
  if (!appointment) return "WAITING";

  if (appointment.cancelled || appointment.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (appointment.status === "DONE") return "DONE";
  if (appointment.status === "MISSED") return "MISSED";
  if (appointment.status === "IN_PROGRESS") return "IN_PROGRESS";
  if (appointment.status === "CALLED") return "CALLED";

  return "WAITING";
};

const getQueueDayKeyFromAppointment = (appointment) => {
  const slotDate = String(appointment?.slotDate || "").trim();
  if (!slotDate) return formatUzDayKey();
  return slotDate;
};

const getNextQueueNo = async ({ dentistId, dayKey, session = null }) => {
  const q = orthodontistQueueModel
    .findOne({ dentistId, dayKey })
    .sort({ queueNo: -1 })
    .select("queueNo");

  if (session) q.session(session);

  const last = await q.lean();
  return Number(last?.queueNo || 0) + 1;
};

const buildQueueSourceFromAppointment = (appointment, fallback = "ONLINE") => {
  if (appointment?.isWalkIn) {
    if (appointment?.createdFrom === "ADMIN") return QUEUE_SOURCES.ADMIN_WALKIN;
    if (appointment?.createdFrom === "DENTIST")
      return QUEUE_SOURCES.DENTIST_WALKIN;
  }

  if (appointment?.createdFrom === "ADMIN") return "ADMIN_BOOKING";
  if (appointment?.createdFrom === "DENTIST") return "DENTIST_BOOKING";

  return fallback;
};

const buildQueueStatusCounts = (items) => ({
  total: items.length,
  waitingCount: items.filter((x) => x.status === "WAITING").length,
  calledCount: items.filter((x) => x.status === "CALLED").length,
  inProgressCount: items.filter((x) => x.status === "IN_PROGRESS").length,
  doneCount: items.filter((x) => x.status === "DONE").length,
  missedCount: items.filter((x) => x.status === "MISSED").length,
  cancelledCount: items.filter((x) => x.status === "CANCELLED").length,
  activeCount: items.filter((x) => ACTIVE_STATUSES.includes(x.status)).length,
});

const DEFAULT_MINUTES_PER_PATIENT = Number(
  process.env.ORTHO_QUEUE_MINUTES_PER_PATIENT || 15,
);

const countPeopleAhead = (items, targetQueueNo) => {
  return items.filter(
    (x) =>
      ["WAITING", "CALLED", "IN_PROGRESS"].includes(String(x.status || "")) &&
      Number(x.queueNo || 0) < Number(targetQueueNo || 0),
  ).length;
};

const estimateApproxMinutes = ({
  peopleAhead,
  hasCurrentInProgress,
  perPatientMinutes = DEFAULT_MINUTES_PER_PATIENT,
}) => {
  const safePeopleAhead = Math.max(0, Number(peopleAhead || 0));
  const per = Math.max(
    5,
    Number(perPatientMinutes || DEFAULT_MINUTES_PER_PATIENT),
  );

  // If someone is currently in progress, include them too.
  const units = safePeopleAhead + (hasCurrentInProgress ? 1 : 0);

  return units * per;
};

const ORTHO_FOLLOW_UP_OPTIONS = [3, 7, 10, 15];

const normalizeOrthodontistFollowUpDays = (value) => {
  const num = Number(value || 0);
  return ORTHO_FOLLOW_UP_OPTIONS.includes(num) ? num : null;
};

const moveOrthodontistSundayToMonday = (dateStr) => {
  const raw = String(dateStr || "").trim();
  if (!raw) return "";

  const parts = raw.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return raw;
  }

  const [year, month, day] = parts;
  const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  if (d.getUTCDay() !== 0) {
    return raw;
  }

  return addDaysYMD(raw, 1);
};

const buildOrthodontistNextPlannedDate = ({
  baseDate = new Date(),
  followUpDays,
}) => {
  const normalizedFollowUp = normalizeOrthodontistFollowUpDays(followUpDays);
  if (!normalizedFollowUp) return "";

  const nextDate = addDaysYMD(formatUzDayKey(baseDate), normalizedFollowUp);
  return moveOrthodontistSundayToMonday(nextDate);
};

const recycleMissedOrthodontistEntry = async ({
  existing,
  dentist,
  dayKey,
  location,
  visitPurpose,
  visitPurposeLabel,
  firstVisit,
  distanceMeters,
  now,
}) => {
  const nextQueueNo = await getNextQueueNo({
    dentistId: dentist._id,
    dayKey,
  });

  existing.requeueHistory = Array.isArray(existing.requeueHistory)
    ? existing.requeueHistory
    : [];

  existing.requeueHistory.push({
    previousQueueNo: existing.queueNo || null,
    previousStatus: existing.status || "",
    previousAppointmentId: existing.appointmentId || null,
    previousCalledAt: existing.calledAt || null,
    previousMissedAt: existing.missedAt || null,
    rejoinedAt: now,
    reason: "MISSED_REJOIN",
  });

  existing.queueNo = nextQueueNo;
  existing.status = "WAITING";
  existing.joinedAt = now;

  existing.calledAt = null;
  existing.arrivedAt = null;
  existing.doneAt = null;
  existing.missedAt = null;
  existing.cancelledAt = null;

  // Important: old MISSED appointment must not be reused.
  existing.appointmentId = null;

  existing.followUpDays = null;
  existing.followUpSelectedAt = null;
  existing.nextPlannedDate = "";
  existing.followUpMessageSentAt = null;
  existing.followUpMessageError = "";
  existing.followUpReminderPlanCreatedAt = null;

  const safeVisitPurpose =
    String(visitPurpose || "").trim() ||
    String(existing.visitPurpose || "").trim() ||
    "REGULAR_CONTROL";

  const safeVisitPurposeLabel =
    String(visitPurposeLabel || "").trim() ||
    String(existing.visitPurposeLabel || "").trim() ||
    "Oddiy ortodont nazorat";

  existing.visitPurpose = safeVisitPurpose;
  existing.visitPurposeLabel = safeVisitPurposeLabel;
  existing.firstVisit =
    typeof firstVisit === "boolean" ? firstVisit : Boolean(existing.firstVisit);

  existing.lastLocationAt = now;
  existing.distanceMeters = distanceMeters;
  existing.lastLocation = {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy ?? null,
  };

  await existing.save();

  return {
    ok: true,
    created: false,
    requeued: true,
    dentist,
    entry: existing.toObject(),
    dayKey,
    distanceMeters,
  };
};

const buildOrthodontistFollowUpMoments = ({
  doneAt,
  followUpDays,
  nextDate,
}) => {
  const immediateBase =
    doneAt instanceof Date ? doneAt : new Date(doneAt || Date.now());
  const normalizedFollowUp = normalizeOrthodontistFollowUpDays(followUpDays);

  if (!normalizedFollowUp || !String(nextDate || "").trim()) return [];

  const plan = [
    {
      reminderType: "AFTER_10_SECONDS",
      scheduledFor: new Date(immediateBase.getTime() + 10 * 1000),
    },
  ];

  const offsets =
    normalizedFollowUp >= 15
      ? [10, 7, 5, 3, 1, 0]
      : normalizedFollowUp === 10
        ? [7, 5, 3, 1, 0]
        : normalizedFollowUp === 7
          ? [5, 3, 1, 0]
          : [1, 0];

  const offsetToType = {
    10: "BEFORE_10_DAYS",
    7: "BEFORE_7_DAYS",
    5: "BEFORE_5_DAYS",
    3: "BEFORE_3_DAYS",
    1: "BEFORE_1_DAY",
    0: "SAME_DAY_0700",
  };

  for (const offset of offsets) {
    const targetDate = offset > 0 ? addDaysYMD(nextDate, -offset) : nextDate;
    const scheduledFor = parseUzDateTimeToUtcDate(targetDate, "07:00");
    if (!scheduledFor) continue;

    plan.push({
      reminderType: offsetToType[offset],
      scheduledFor,
    });
  }

  return plan;
};

const scheduleOrthodontistFollowUpReminders = async ({ entry }) => {
  const followUpDays = normalizeOrthodontistFollowUpDays(entry?.followUpDays);
  const nextPlannedDate = String(entry?.nextPlannedDate || "").trim();

  if (
    !entry?._id ||
    !entry?.patientId ||
    !entry?.dentistId ||
    !followUpDays ||
    !nextPlannedDate
  ) {
    return { scheduled: 0 };
  }

  const moments = buildOrthodontistFollowUpMoments({
    doneAt: entry.doneAt || new Date(),
    followUpDays,
    nextDate: nextPlannedDate,
  });

  let scheduled = 0;

  for (const moment of moments) {
    try {
      await orthodontistFollowUpReminderLogModel.create({
        eventKey: `ORTHO_FOLLOW_UP:${entry._id}:${moment.reminderType}`,
        orthodontistQueueId: entry._id,
        patientId: entry.patientId,
        dentistId: entry.dentistId,
        reminderType: moment.reminderType,
        followUpDays,
        nextPlannedDate,
        scheduledFor: moment.scheduledFor,
        status: "PENDING",
      });
      scheduled += 1;
    } catch (error) {
      if (error?.code !== 11000) throw error;
    }
  }

  return { scheduled };
};

const sendOrthodontistFollowUpCompletionIfPossible = async ({ entry }) => {
  const patient = await userModel
    .findById(entry?.patientId)
    .select("name telegram")
    .lean();

  const dentist = await dentistModel
    .findById(entry?.dentistId)
    .select("name")
    .lean();

  const chatId = String(patient?.telegram?.chatId || "").trim();
  const isVerified = Boolean(patient?.telegram?.isVerified);

  if (!chatId || !isVerified) {
    return { ok: false, code: "PATIENT_NOT_LINKED" };
  }

  try {
    const result = await sendTelegramMessage({
      chatId,
      text: buildOrthodontistFollowUpCompletionMessage({
        patient,
        dentist,
        entry,
      }),
      replyMarkup: buildAppointmentsButton(),
    });

    return {
      ok: true,
      messageId: result?.message_id ? String(result.message_id) : "",
    };
  } catch (error) {
    return {
      ok: false,
      code: "SEND_FAILED",
      error: String(error?.message || error || ""),
    };
  }
};

const saveOrthodontistProgressImages = async ({ entry, files = [] }) => {
  if (!entry?._id || !Array.isArray(files) || !files.length) return 0;

  const patient = await userModel
    .findById(entry.patientId)
    .select("patientId name")
    .lean();

  const patientIdFolder =
    patient?.patientId || String(patient?._id || entry.patientId);
  const patientName = patient?.name || "patient";
  const safePatientFolder = safeFilenamePart(patientIdFolder, "patient");

  const targetDir = path.join(
    process.cwd(),
    "uploads",
    "private",
    "patients",
    safePatientFolder,
    "orthodontist-queue",
    String(entry._id),
  );

  ensureDir(targetDir);

  const preparedFiles = await Promise.all(
    files.map((file) =>
      prepareImageForJpegStorage(file.buffer, {
        quality: 90,
        originalName: file.originalname,
      }),
    ),
  );

  let added = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const fileName = buildPatientXrayFileName({
      patientId: patientIdFolder,
      patientName,
      index: entry.progressImages.length + added + 1,
      ext: ".jpg",
    });

    const finalAbsPath = path.join(targetDir, fileName);

    await writePreparedImageToFile(preparedFiles[index], finalAbsPath);

    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {}

    const stat = fs.statSync(finalAbsPath);

    entry.progressImages.push({
      path: safeRelPath(finalAbsPath),
      originalName: file.originalname || "",
      mimeType: "image/jpeg",
      sizeBytes: stat.size,
      uploadedAt: new Date(),
    });

    added += 1;
  }

  return added;
};

const finalizeOrthodontistQueueEntry = async ({
  entry,
  dentistId,
  files = [],
}) => {
  const now = new Date();

  if (!entry.arrivedAt) {
    entry.arrivedAt = now;
  }

  const followUpDays = normalizeOrthodontistFollowUpDays(entry.followUpDays);
  if (followUpDays) {
    entry.nextPlannedDate = buildOrthodontistNextPlannedDate({
      baseDate: now,
      followUpDays,
    });
  }

  if (Array.isArray(files) && files.length) {
    await saveOrthodontistProgressImages({ entry, files });
  }

  entry.status = "DONE";
  entry.doneAt = now;
  await entry.save();

  await syncLinkedAppointmentStatus({
    entry,
    nextStatus: "DONE",
    dentistId,
  });

  if (!followUpDays) {
    entry.followUpMessageError = "FOLLOW_UP_NOT_SELECTED";
    await entry.save();

    return {
      entry: entry.toObject(),
      telegram: { ok: false, code: "FOLLOW_UP_NOT_SELECTED" },
      reminders: { scheduled: 0 },
    };
  }

  const telegram = await sendOrthodontistFollowUpCompletionIfPossible({
    entry,
  });

  if (telegram.ok) {
    entry.followUpMessageSentAt = new Date();
    entry.followUpMessageError = "";
  } else {
    entry.followUpMessageError = String(telegram.code || telegram.error || "");
  }

  let reminders = { scheduled: 0 };

  try {
    reminders = await scheduleOrthodontistFollowUpReminders({ entry });
  } catch (error) {
    entry.followUpMessageError = [
      String(entry.followUpMessageError || "").trim(),
      `REMINDER_PLAN_FAILED:${String(error?.message || error || "")}`,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  if ((reminders?.scheduled || 0) > 0) {
    entry.followUpReminderPlanCreatedAt = new Date();
  }

  await entry.save();

  return {
    entry: entry.toObject(),
    telegram,
    reminders,
  };
};

export const resolveOrthodontistDentist = async () => {
  const forcedId = String(process.env.ORTHODONTIST_DENTIST_ID || "").trim();

  if (forcedId) {
    let dentist = null;
    if (mongoose.Types.ObjectId.isValid(forcedId)) {
      dentist = await dentistModel.findById(forcedId).lean();
    }
    if (!dentist) {
      dentist = await dentistModel.findOne({ dentistId: forcedId }).lean();
    }
    if (dentist) {
      return dentist;
    }
  }

  const orthoRegex = /ortodont/i;
  const dentists = await dentistModel
    .find({ isArchived: { $ne: true }, speciality: { $elemMatch: { $regex: orthoRegex } } })
    .lean();

  if (dentists.length > 0) {
    return dentists[0];
  }

  const fallbackDentist = await dentistModel.findOne({ isArchived: { $ne: true } }).lean();
  if (fallbackDentist) {
    return fallbackDentist;
  }

  throw new Error("Ortodont shifokor topilmadi");
};

export const healOrthodontistQueueEntries = async ({ dentistId, dayKey }) => {
  try {
    if (!dentistId || !dayKey) return;

    const activeEntries = await orthodontistQueueModel
      .find({
        dentistId,
        dayKey,
      })
      .populate("appointmentId");

    for (const entry of activeEntries) {
      let app = entry.appointmentId;
      if (!app && entry.patientId) {
        app = await appointmentModel.findOne({
          userId: entry.patientId,
          slotDate: dayKey,
          dentistID: dentistId,
          cancelled: { $ne: true },
        }).sort({ createdAt: -1 });

        if (app) {
          entry.appointmentId = app._id;
        }
      }

      if (app) {
        const appStatus = normalizeAppointmentQueueStatus(app);
        if (appStatus === "DONE" && entry.status !== "DONE") {
          entry.status = "DONE";
          entry.doneAt = entry.doneAt || new Date();
          await entry.save();
        } else if (appStatus === "CANCELLED" && entry.status !== "CANCELLED") {
          entry.status = "CANCELLED";
          entry.cancelledAt = entry.cancelledAt || new Date();
          await entry.save();
        } else if (appStatus === "MISSED" && entry.status !== "MISSED") {
          entry.status = "MISSED";
          entry.missedAt = entry.missedAt || new Date();
          await entry.save();
        } else if (appStatus === "IN_PROGRESS" && entry.status === "WAITING") {
          entry.status = "IN_PROGRESS";
          entry.arrivedAt = entry.arrivedAt || new Date();
          await entry.save();
        }
      }
    }
  } catch (error) {
    console.error("[healOrthodontistQueueEntries] Error healing active queue entries:", error);
  }
};

export const getOrthodontistQueueSnapshot = async ({ dentistId, dayKey }) => {
  await ensureUnifiedOrthodontistQueueEntriesForToday({ dentistId, dayKey });
  await healOrthodontistQueueEntries({ dentistId, dayKey });

  const items = await orthodontistQueueModel
    .find({ dentistId, dayKey })
    .populate("patientId", "name patientId phone")
    .populate(
      "appointmentId",
      "slotDate slotTime status cancelled isWalkIn createdFrom appointmentType",
    )
    .sort({ queueNo: 1 })
    .lean();

  const filteredItems = items.filter((x) => {
    // If appointment is explicitly NORMAL and not from ORTHO source, exclude from ortho queue
    if (
      x?.appointmentId &&
      x.appointmentId.appointmentType === "NORMAL" &&
      !String(x?.source || "").includes("ORTHO")
    ) {
      return false;
    }
    return true;
  });

  const normalizedItems = filteredItems.map((x) => {
    const queueStatus = String(x?.status || "").trim() || "WAITING";
    const linkedStatus = x?.appointmentId
      ? normalizeAppointmentQueueStatus(x.appointmentId)
      : null;

    const shouldOverrideFromAppointment = [
      "IN_PROGRESS",
      "DONE",
      "MISSED",
      "CANCELLED",
    ].includes(String(linkedStatus || "").trim());

    return {
      ...x,
      status: shouldOverrideFromAppointment
        ? linkedStatus
        : queueStatus || linkedStatus || "WAITING",
    };
  });

  const current =
    normalizedItems.find((x) => x.status === "IN_PROGRESS") ||
    normalizedItems.find((x) => x.status === "CALLED") ||
    null;

  const next = current
    ? normalizedItems.find(
        (x) => x.queueNo > current.queueNo && x.status === "WAITING",
      ) || null
    : normalizedItems.find((x) => x.status === "WAITING") || null;

  return {
    items: normalizedItems,
    current,
    next,
    ...buildQueueStatusCounts(normalizedItems),
  };
};

export const findTodayPatientOrthodontistEntry = async ({
  patientId,
  dentistId = null,
  dayKey = formatUzDayKey(),
}) => {
  let resolvedDentistId = dentistId;

  if (!resolvedDentistId) {
    const orthodontist = await resolveOrthodontistDentist();
    resolvedDentistId = orthodontist?._id || null;
  }

  if (!resolvedDentistId) return null;

  return orthodontistQueueModel
    .findOne({
      patientId,
      dentistId: resolvedDentistId,
      dayKey,
    })
    .sort({ createdAt: -1 })
    .lean();
};

export const joinOrthodontistQueueFromTelegram = async ({
  patientId,
  chatId,
  location,
  visitPurpose = "REGULAR_CONTROL",
  visitPurposeLabel = "Oddiy ortodont nazorat",
  firstVisit = false,
}) => {
  const clinic = getClinicCoordinates();
  if (!clinic) {
    throw new Error("Klinika koordinatalari sozlanmagan");
  }

  const dentist = await resolveOrthodontistDentist();
  const dayKey = formatUzDayKey();
  const distanceMeters = haversineMeters(clinic, location);
  const nearMeters = Math.max(
    10,
    Number(process.env.ORTHODONTIST_NEAR_METERS || 100),
  );

  if (distanceMeters > nearMeters) {
    return {
      ok: false,
      code: "TOO_FAR",
      dentist,
      distanceMeters,
      nearMeters,
    };
  }

  const existing = await orthodontistQueueModel
    .findOne({ patientId, dentistId: dentist._id, dayKey })
    .sort({ createdAt: -1 });

  const now = new Date();
  const cooldownSeconds = Math.max(
    3,
    Number(process.env.ORTHODONTIST_LOCATION_COOLDOWN_SECONDS || 10),
  );

       if (existing) {
         if (["DONE", "CANCELLED"].includes(existing.status)) {
           return {
             ok: false,
             code: "ALREADY_CLOSED_TODAY",
             dentist,
             entry: existing.toObject(),
             dayKey,
             distanceMeters,
           };
         }

         if (existing.status === "MISSED") {
           const safeVisitPurpose =
             String(visitPurpose || "").trim() ||
             String(existing.visitPurpose || "").trim() ||
             "REGULAR_CONTROL";

           const safeVisitPurposeLabel =
             String(visitPurposeLabel || "").trim() ||
             String(existing.visitPurposeLabel || "").trim() ||
             "Oddiy ortodont nazorat";

           return recycleMissedOrthodontistEntry({
             existing,
             dentist,
             dayKey,
             location,
             visitPurpose: safeVisitPurpose,
             visitPurposeLabel: safeVisitPurposeLabel,
             firstVisit:
               typeof firstVisit === "boolean"
                 ? firstVisit
                 : Boolean(existing.firstVisit),
             distanceMeters,
             now,
           });
         }

         const recentLocationMs = existing.lastLocationAt
           ? now.getTime() - new Date(existing.lastLocationAt).getTime()
           : null;

         if (
           recentLocationMs !== null &&
           recentLocationMs < cooldownSeconds * 1000
         ) {
           return {
             ok: true,
             created: false,
             dentist,
             entry: existing.toObject(),
             dayKey,
             distanceMeters,
             cooldownHit: true,
           };
         }

         existing.visitPurpose = visitPurpose;
         existing.visitPurposeLabel = visitPurposeLabel;
         existing.firstVisit = Boolean(firstVisit);
         existing.lastLocationAt = now;
         existing.distanceMeters = distanceMeters;
         existing.lastLocation = {
           latitude: location.latitude,
           longitude: location.longitude,
           accuracy: location.accuracy ?? null,
         };
         await existing.save();

         return {
           ok: true,
           created: false,
           dentist,
           entry: existing.toObject(),
           dayKey,
           distanceMeters,
         };
       }
  
  const last = await orthodontistQueueModel
    .findOne({ dentistId: dentist._id, dayKey })
    .sort({ queueNo: -1 })
    .select("queueNo")
    .lean();

  try {
    const entry = await orthodontistQueueModel.create({
      dayKey,
      patientId,
      dentistId: dentist._id,
      appointmentId: null,
      firstVisit: Boolean(firstVisit),
      visitPurpose,
      visitPurposeLabel,
      queueNo: Number(last?.queueNo || 0) + 1,
      status: "WAITING",
      source: "TELEGRAM",
      joinedAt: now,
      lastLocationAt: now,
      distanceMeters,
      lastLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ?? null,
      },
    });

    return {
      ok: true,
      created: true,
      dentist,
      entry: entry.toObject(),
      dayKey,
      distanceMeters,
    };
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const concurrent = await orthodontistQueueModel
      .findOne({ patientId, dentistId: dentist._id, dayKey })
      .sort({ createdAt: -1 });

    if (!concurrent) {
      throw error;
    }

    return {
      ok: true,
      created: false,
      dentist,
      entry: concurrent.toObject(),
      dayKey,
      distanceMeters,
      duplicateCollapsed: true,
    };
  }
};

export const buildQueuePatientView = async ({ patientId }) => {
  const dentist = await resolveOrthodontistDentist();
  const dayKey = formatUzDayKey();

  const snapshot = await getOrthodontistQueueSnapshot({
    dentistId: dentist._id,
    dayKey,
  });

  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];

  const entry = items.find(
    (x) =>
      String(x?.patientId?._id || x?.patientId || "") === String(patientId),
  );

  if (!entry) {
    return {
      found: false,
      dentist,
      snapshot,
      entry: null,
      queueNo: null,
      peopleAhead: 0,
      approxMinutes: 0,
      currentQueueNo: snapshot?.current?.queueNo || null,
      nextQueueNo: snapshot?.next?.queueNo || null,
    };
  }

  const peopleAhead = countPeopleAhead(items, entry.queueNo);
  const hasCurrentInProgress = Boolean(
    snapshot?.current &&
    String(snapshot.current.status || "") === "IN_PROGRESS",
  );

  const approxMinutes = estimateApproxMinutes({
    peopleAhead,
    hasCurrentInProgress,
  });

  return {
    found: true,
    dentist,
    snapshot,
    entry,
    queueNo: entry.queueNo,
    peopleAhead,
    approxMinutes,
    currentQueueNo: snapshot?.current?.queueNo || null,
    nextQueueNo: snapshot?.next?.queueNo || null,
  };
};

export const convertOrthodontistQueueToVisit = async ({
  entryId,
  dentistId,
  firstVisit = false,
}) => {
  const entry = await orthodontistQueueModel.findById(entryId);
  if (!entry) throw new Error("Navbat yozuvi topilmadi");

  if (String(entry.dentistId) !== String(dentistId)) {
    throw new Error("Bu navbat boshqa shifokorga tegishli");
  }

  if (TERMINAL_STATUSES.includes(entry.status)) {
    throw new Error("Yopilgan navbatni oddiy qabulga o‘tkazib bo‘lmaydi");
  }

  if (entry.appointmentId) {
    const existingById = await appointmentModel.findById(entry.appointmentId);
    if (existingById) {
      if (firstVisit && !entry.firstVisit) {
        entry.firstVisit = true;
        await entry.save();
      }
      return existingById;
    }
  }

  const now = nowSlotDateTime();

    const existingToday = await appointmentModel
      .findOne({
        userId: entry.patientId,
        dentistID: entry.dentistId,
        slotDate: now.slotDate,
        cancelled: false,
        status: { $nin: ["DONE", "MISSED", "CANCELLED"] },
      })
      .sort({ createdAt: -1 });

  if (existingToday) {
    entry.appointmentId = existingToday._id;
    if (firstVisit) entry.firstVisit = true;
    await entry.save();
    return existingToday;
  }

  const appointment = await appointmentModel.create({
    userId: entry.patientId,
    dentistID: entry.dentistId,
    slotDate: now.slotDate,
    slotTime: now.slotTime,
    date: now.dateMs,
    createdFrom: "DENTIST",
    isWalkIn: true,
    walkInNote: firstVisit ? ORTHO_FIRST_VISIT_NOTE : ORTHO_WALKIN_NOTE,
    status: "WAITING",
    cancelled: false,
    startedAt: null,
  });

  entry.appointmentId = appointment._id;
  if (firstVisit) entry.firstVisit = true;

  await entry.save();

  return appointment;
};

const syncLinkedAppointmentStatus = async ({
  entry,
  nextStatus,
  dentistId,
}) => {
  if (!entry.appointmentId) return null;

  const appointment = await appointmentModel.findById(entry.appointmentId);
  if (!appointment) return null;

  if (nextStatus === "IN_PROGRESS") {
    const now = nowSlotDateTime();

    appointment.slotDate = now.slotDate;
    appointment.slotTime = now.slotTime;
    appointment.date = now.dateMs;
    appointment.status = "IN_PROGRESS";
    appointment.cancelled = false;
    appointment.startedAt = Date.now();

    await appointment.save();

    await setBusy({
      dentistID: dentistId,
      appointmentId: appointment._id,
      reason: "ORTHODONTIST_QUEUE",
      note: entry.firstVisit ? ORTHO_FIRST_VISIT_NOTE : ORTHO_WALKIN_NOTE,
    });
  }

  if (nextStatus === "DONE") {
    if (appointment.status !== "DONE") {
      appointment.status = "DONE";
      await appointment.save();
    }
    await setAvailable(dentistId);
  }

  if (nextStatus === "MISSED") {
    if (appointment.status === "WAITING") {
      appointment.status = "MISSED";
      await appointment.save();
    }
  }

  if (nextStatus === "CANCELLED") {
    appointment.status = "CANCELLED";
    appointment.cancelled = true;
    await appointment.save();
    await setAvailable(dentistId);
  }

  return appointment;
};

export const updateOrthodontistQueueStatus = async ({
  entryId,
  dentistId,
  nextStatus,
  followUpDays = null,
}) => {
  const initialEntry = await orthodontistQueueModel.findById(entryId);
  if (!initialEntry) throw new Error("Navbat yozuvi topilmadi");

  if (String(initialEntry.dentistId) !== String(dentistId)) {
    throw new Error("Bu navbat boshqa shifokorga tegishli");
  }

  await healOrthodontistQueueEntries({ dentistId, dayKey: initialEntry.dayKey });

  const entry = await orthodontistQueueModel.findById(entryId);
  if (!entry) throw new Error("Navbat yozuvi topilmadi");

  const now = new Date();

  if (nextStatus === "CALLED") {
    if (!["WAITING", "CALLED"].includes(entry.status)) {
      throw new Error("Faqat WAITING yoki CALLED holatdan chaqirish mumkin");
    }

    const existingCalled = await orthodontistQueueModel.findOne({
      _id: { $ne: entry._id },
      dayKey: entry.dayKey,
      dentistId,
      status: "CALLED",
    });

    if (existingCalled) {
      throw new Error("Avval chaqirilgan bemor holatini yakunlang");
    }

    entry.status = "CALLED";
    entry.calledAt = now;
  } else if (nextStatus === "IN_PROGRESS") {
    if (!["WAITING", "CALLED"].includes(entry.status)) {
      throw new Error("Faqat WAITING yoki CALLED holatdan boshlash mumkin");
    }

    const existingInProgress = await orthodontistQueueModel.findOne({
      _id: { $ne: entry._id },
      dayKey: entry.dayKey,
      dentistId,
      status: "IN_PROGRESS",
    });

    if (existingInProgress) {
      throw new Error("Boshqa bemor allaqachon qabulda");
    }

    if (!entry.appointmentId) {
      const appointment = await convertOrthodontistQueueToVisit({
        entryId: entry._id,
        dentistId,
        firstVisit: Boolean(entry.firstVisit),
      });
      entry.appointmentId = appointment._id;
    }

    entry.status = "IN_PROGRESS";
    if (!entry.arrivedAt) {
      entry.arrivedAt = now;
    }
  } else if (nextStatus === "DONE") {
    if (TERMINAL_STATUSES.includes(entry.status) && entry.status !== "DONE") {
      throw new Error("Bu yozuv allaqachon yopilgan");
    }

    const result = await finalizeOrthodontistQueueEntry({
      entry,
      dentistId,
      files: [],
    });

    return result.entry;
  } else if (nextStatus === "MISSED") {
    if (!["WAITING", "CALLED"].includes(entry.status)) {
      throw new Error(
        "Faqat WAITING yoki CALLED holatdan kelmadi qilish mumkin",
      );
    }
    entry.status = "MISSED";
    entry.missedAt = now;
  } else if (nextStatus === "CANCELLED") {
    if (TERMINAL_STATUSES.includes(entry.status)) {
      throw new Error("Bu yozuv allaqachon yopilgan");
    }
    entry.status = "CANCELLED";
    entry.cancelledAt = now;
  } else if (nextStatus === "WAITING") {
    if (entry.status !== "CALLED") {
      throw new Error("Faqat CALLED holatdan qayta WAITING qilish mumkin");
    }
    entry.status = "WAITING";
  } else {
    throw new Error("Noto‘g‘ri status");
  }

  await entry.save();
  await syncLinkedAppointmentStatus({ entry, nextStatus, dentistId });

  return entry.toObject();
};

export const completeOrthodontistQueueEntry = async ({
  entryId,
  dentistId,
  files = [],
  followUpDays = null,
}) => {
  const entry = await orthodontistQueueModel.findById(entryId);
  if (!entry) throw new Error("Navbat yozuvi topilmadi");

  if (String(entry.dentistId) !== String(dentistId)) {
    throw new Error("Bu navbat boshqa shifokorga tegishli");
  }

  if (TERMINAL_STATUSES.includes(entry.status) && entry.status !== "DONE") {
    throw new Error("Bu navbat allaqachon yopilgan");
  }

  const normalizedFollowUp = normalizeOrthodontistFollowUpDays(followUpDays);
  if (!normalizedFollowUp) {
    throw new Error("Qabulni tugatishdan oldin 3, 7, 10 yoki 15 kun tanlang");
  }

  entry.followUpDays = normalizedFollowUp;
  entry.followUpSelectedAt = new Date();
  entry.nextPlannedDate = buildOrthodontistNextPlannedDate({
    baseDate: new Date(),
    followUpDays: normalizedFollowUp,
  });

  return finalizeOrthodontistQueueEntry({
    entry,
    dentistId,
    files,
  });
};

export const completeOrthodontistQueueByAppointment = async ({
  appointmentId,
  dentistId,
}) => {
  let entry = await orthodontistQueueModel.findOne({
    $or: [{ appointmentId }, { appointmentId: String(appointmentId) }],
  });

  if (!entry && dentistId) {
    entry = await orthodontistQueueModel.findOne({
      appointmentId,
      dentistId,
    });
  }

  if (!entry) {
    const app = await appointmentModel.findById(appointmentId).lean();
    if (app) {
      entry = await orthodontistQueueModel.findOne({
        patientId: app.userId,
        dayKey: app.slotDate,
        status: { $nin: ["DONE", "CANCELLED"] },
      });
    }
  }

  if (!entry) return null;

  if (entry.status === "DONE") {
    return entry.toObject ? entry.toObject() : entry;
  }

  entry.status = "DONE";
  entry.doneAt = entry.doneAt || new Date();
  await entry.save();

  return entry.toObject ? entry.toObject() : entry;
};

export const getLinkedPatientByChatId = async (chatId) => {
  const patients = await listLinkedPatientsByChatId(chatId, { limit: 15 });
  if (patients.length <= 1) return patients[0] || null;
  const selectedPatientId = String(patients.find((patient) => patient?.telegram?.familySelectedPatientId)?.telegram?.familySelectedPatientId || "");
  if (selectedPatientId) {
    return patients.find((patient) => String(patient._id) === selectedPatientId) || patients[0] || null;
  }
  return patients[0] || null;
};

export const ensureUnifiedOrthodontistQueueEntriesForToday = async ({
  dentistId,
  dayKey = formatUzDayKey(),
}) => {
  const todayAppointments = await appointmentModel
    .find({
      dentistID: dentistId,
      slotDate: dayKey,
      appointmentType: "ORTHODONTIC",
      cancelled: { $ne: true },
    })
    .sort({ slotTime: 1, createdAt: 1, date: 1 })
    .lean();

  if (!todayAppointments.length) return { created: 0, updated: 0 };

  const existingQueue = await orthodontistQueueModel
    .find({ dentistId, dayKey })
    .select(
      "_id patientId appointmentId queueNo status source firstVisit joinedAt arrivedAt calledAt doneAt missedAt cancelledAt",
    )
    .lean();

  const byAppointmentId = new Map();
  const byPatientId = new Map();

  for (const row of existingQueue) {
    if (row?.appointmentId) {
      byAppointmentId.set(String(row.appointmentId), row);
    }
    if (row?.patientId) {
      byPatientId.set(String(row.patientId), row);
    }
  }

  let nextQueueNo =
    existingQueue.reduce((m, x) => Math.max(m, Number(x.queueNo || 0)), 0) + 1;

  let created = 0;
  let updated = 0;

  for (const appointment of todayAppointments) {
    const appointmentId = String(appointment._id);
    const patientId = String(appointment.userId || "");

    const mappedStatus = normalizeAppointmentQueueStatus(appointment);

    let existing =
      byAppointmentId.get(appointmentId) || byPatientId.get(patientId) || null;

    if (!existing) {
      const entry = await orthodontistQueueModel.create({
        dayKey,
        patientId: appointment.userId,
        dentistId,
        appointmentId: appointment._id,
        firstVisit:
          appointment.walkInNote === ORTHO_FIRST_VISIT_NOTE ? true : false,
        visitPurpose: appointment.isWalkIn ? "WALK_IN" : "ONLINE_APPOINTMENT",
        visitPurposeLabel: appointment.isWalkIn
          ? "Jonli qabul"
          : "Onlayn yozilgan bemor",
        queueNo: nextQueueNo++,
        status: mappedStatus,
        source: buildQueueSourceFromAppointment(
          appointment,
          QUEUE_SOURCES.ONLINE,
        ),
        joinedAt: appointment.createdAt || new Date(),
        arrivedAt:
          mappedStatus === "IN_PROGRESS" || appointment.status === "DONE"
            ? new Date(appointment.startedAt || appointment.date || Date.now())
            : null,
        calledAt: null,
        doneAt: mappedStatus === "DONE" ? new Date() : null,
        missedAt: mappedStatus === "MISSED" ? new Date() : null,
        cancelledAt: mappedStatus === "CANCELLED" ? new Date() : null,
      });

      const plain = entry.toObject();
      byAppointmentId.set(appointmentId, plain);
      byPatientId.set(patientId, plain);
      created += 1;
      continue;
    }

    const patch = {};
    let changed = false;

    if (!existing.appointmentId) {
      patch.appointmentId = appointment._id;
      changed = true;
    }

    if (existing.status !== mappedStatus) {
      patch.status = mappedStatus;
      changed = true;
    }

    if (
      appointment.walkInNote === ORTHO_FIRST_VISIT_NOTE &&
      !existing.firstVisit
    ) {
      patch.firstVisit = true;
      changed = true;
    }

    if (changed) {
      await orthodontistQueueModel.updateOne(
        { _id: existing._id },
        { $set: patch },
      );
      updated += 1;
    }
  }

  return { created, updated };
};

export const attachAppointmentToUnifiedOrthodontistQueue = async ({
  appointment,
  source = QUEUE_SOURCES.ONLINE,
  firstVisit = false,
}) => {
  if (!appointment) throw new Error("appointment kerak");

  const dentistId = appointment.dentistID;
  const dayKey = getQueueDayKeyFromAppointment(appointment);

  let existing = await orthodontistQueueModel.findOne({
    dentistId,
    dayKey,
    appointmentId: appointment._id,
  });

  if (existing) return existing;

  existing = await orthodontistQueueModel
    .findOne({
      dentistId,
      dayKey,
      patientId: appointment.userId,
    })
    .sort({ createdAt: -1 });

  if (existing) {
    existing.appointmentId = appointment._id;
    if (firstVisit) existing.firstVisit = true;
    if (!existing.source) existing.source = source;
    await existing.save();
    return existing;
  }

  const queueNo = await getNextQueueNo({ dentistId, dayKey });

  return orthodontistQueueModel.create({
    dayKey,
    patientId: appointment.userId,
    dentistId,
    appointmentId: appointment._id,
    firstVisit: Boolean(firstVisit),
    visitPurpose: appointment.isWalkIn ? "WALK_IN" : "ONLINE_APPOINTMENT",
    visitPurposeLabel: appointment.isWalkIn
      ? "Jonli qabul"
      : "Onlayn yozilgan bemor",
    queueNo,
    status: normalizeAppointmentQueueStatus(appointment),
    source,
    joinedAt: new Date(),
    arrivedAt: null,
  });
};

export const buildTelegramQueueConfirmationText = ({
  patientName,
  dentistName,
  queueNo,
  peopleAhead,
  approxMinutes,
  visitPurposeLabel,
  status,
  currentQueueNo,
  nextQueueNo,
}) => {
  const safePatient = String(patientName || "Bemor").trim();
  const safeDentist = String(dentistName || "Ortodont").trim();
  const safePurpose = String(visitPurposeLabel || "Ortodont navbati").trim();
  const safeStatus = String(status || "WAITING").trim();

  const statusLabelMap = {
    WAITING: "Kutilmoqda",
    CALLED: "Chaqirildi",
    IN_PROGRESS: "Qabulda",
    DONE: "Yakunlandi",
    MISSED: "Kelmagan",
    CANCELLED: "Bekor qilingan",
  };

  const statusLabel = statusLabelMap[safeStatus] || safeStatus;

  const approxText =
    approxMinutes <= 0
      ? "Navbat deyarli yetib keldi"
      : `Taxminiy kutish vaqti: ${approxMinutes} daqiqa`;

  const aheadText =
    peopleAhead <= 0
      ? "Sizdan oldinda faol bemor yo‘q"
      : `Sizdan oldinda ${peopleAhead} ta bemor bor`;

  return (
    `Assalomu alaykum, ${safePatient}!\n\n` +
    `✅ Siz ortodont navbatga muvaffaqiyatli qo‘shildingiz.\n\n` +
    `👨‍⚕️ Shifokor: ${safeDentist}\n` +
    `🦷 Tashrif turi: ${safePurpose}\n` +
    `🎟 Navbat raqamingiz: #${queueNo}\n` +
    `📌 Holat: ${statusLabel}\n` +
    `👥 ${aheadText}\n` +
    `⏳ ${approxText}\n\n` +
    `🔹 Hozir qabulda: ${currentQueueNo ? `#${currentQueueNo}` : "yo‘q"}\n` +
    `🔹 Keyingi: ${nextQueueNo ? `#${nextQueueNo}` : "yo‘q"}\n\n` +
    `Joylashuvingiz yaqin deb tasdiqlandi. Navbat yangilanganda sizga xabar beriladi.`
  );
};

export const listLinkedPatientsByChatId = async (chatId, { limit = 15 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 15, 1), 15);
  return userModel
    .find({
      "telegram.chatId": String(chatId),
      "telegram.isVerified": true,
    })
    .select("name phone patientId telegram createdAt updatedAt")
    .sort({ "telegram.linkedAt": -1, createdAt: 1 })
    .limit(safeLimit);
};

