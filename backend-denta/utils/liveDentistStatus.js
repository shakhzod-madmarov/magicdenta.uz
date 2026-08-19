import appointmentModel from "../models/appointmentsModel.js";
import dentistLiveStatusModel from "../models/dentistLiveStatusModel.js";
import {
  formatYMD,
  buildNowSlot,
  slotDateTimeToUtcMs,
} from "../../shared/date.js";

export const GRACE_MINUTES = 15;
export const WALKIN_MAX_WAIT_MINUTES = 60;
export const ADMIN_MAX_SHOW_MINUTES = 30;

const BOOKED_PRIORITY_MINUTES = 10;
const BOOKED_CALL_MINUTES = 5;

const pad2 = (n) => String(n).padStart(2, "0");

export const roundTo5Min = (d = new Date()) => {
  const x = new Date(d);
  x.setSeconds(0, 0);
  const m = x.getMinutes();
  x.setMinutes(m - (m % 5));
  return x;
};

export const nowSlotDateTime = () => {
  const d = roundTo5Min(new Date());
  const slotDate = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate(),
  )}`;
  const slotTime = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { d, slotDate, slotTime, dateMs: d.getTime() };
};

const slotToMs = (slotDate, slotTime, fallback = 0) => {
  const ms = slotDateTimeToUtcMs(slotDate, slotTime, fallback);
  return Number.isNaN(ms) ? Number(fallback || 0) : ms;
};

const minutesCeilClamped = (ms) => Math.max(0, Math.ceil(ms / 60000));

const calcWalkInMinutesLeft = (a, nowMs, { live, hasActive }) => {
  if (hasActive) {
    return WALKIN_MAX_WAIT_MINUTES;
  }

  const createdMs = a?.createdAt
    ? new Date(a.createdAt).getTime()
    : Number(a?.date || nowMs);

  const lastFinishedAt = Number(live?.lastFinishedAt || 0);

  let base = createdMs || nowMs;
  if (lastFinishedAt && lastFinishedAt > base) {
    base = lastFinishedAt;
  }

  const passed = minutesCeilClamped(nowMs - base);
  return Math.max(0, WALKIN_MAX_WAIT_MINUTES - passed);
};

const calcBookedMinutesLeft = (a, nowMs, { live, hasActive }) => {
  const slotMs = slotToMs(a.slotDate, a.slotTime, a.date);
  const lastFinishedAt = Number(live?.lastFinishedAt || 0);

  if (slotMs > nowMs) {
    return minutesCeilClamped(slotMs - nowMs);
  }

  if (hasActive) return GRACE_MINUTES;

  const baseStart = Math.max(slotMs || 0, lastFinishedAt || 0);
  const passed = minutesCeilClamped(nowMs - baseStart);
  return Math.max(0, GRACE_MINUTES - passed);
};

export const setBusy = async ({
  dentistID,
  appointmentId,
  reason = "",
  note = "",
}) => {
  if (!dentistID) return null;

  return dentistLiveStatusModel.findOneAndUpdate(
    { dentistID },
    {
      $set: {
        state: "BUSY",
        currentAppointmentId: appointmentId || null,
        reason,
        note,
        lastBusyAt: Date.now(),
      },
    },
    { upsert: true, new: true },
  );
};

export const setAvailable = async (dentistID, meta = {}) => {
  if (!dentistID) return null;

  const finishedAt = meta?.finishedAt ? Number(meta.finishedAt) : Date.now();

  return dentistLiveStatusModel.findOneAndUpdate(
    { dentistID },
    {
      $set: {
        state: "AVAILABLE",
        currentAppointmentId: null,
        reason: "",
        note: "",
        lastFinishedAt: finishedAt,
      },
    },
    { upsert: true, new: true },
  );
};

export const getDentistComputedStatus = async (dentistID) => {
  const nowMs = Date.now();
  const today = formatYMD(new Date());

  const live = await dentistLiveStatusModel.findOne({ dentistID }).lean();

  const active = await appointmentModel
    .findOne({
      dentistID,
      status: "IN_PROGRESS",
      cancelled: false,
    })
    .sort({ startedAt: -1, date: -1 })
    .select("_id slotDate slotTime isWalkIn createdAt date")
    .lean();

  const hasActive = Boolean(active);

  if (!hasActive && live?.state === "BUSY" && live?.currentAppointmentId) {
    const cur = await appointmentModel
      .findById(live.currentAppointmentId)
      .select("status cancelled")
      .lean();

    if (!cur || cur.cancelled || cur.status !== "IN_PROGRESS") {
      await dentistLiveStatusModel.updateOne(
        { dentistID },
        {
          $set: {
            state: "AVAILABLE",
            currentAppointmentId: null,
            reason: "",
            note: "",
          },
        },
      );
    }
  }

  const state = hasActive ? "BUSY" : "AVAILABLE";
  const currentAppointmentId = hasActive ? active._id : null;

  const waitingToday = await appointmentModel
    .find({
      dentistID,
      slotDate: today,
      status: "WAITING",
      cancelled: false,
    })
    .sort({ slotTime: 1, createdAt: 1 })
    .select("_id slotDate slotTime date userId isWalkIn createdAt")
    .populate("userId", "name phone patientId")
    .lean();

  const booked = waitingToday.filter((x) => !x.isWalkIn);
  const walkins = waitingToday.filter((x) => x.isWalkIn);

  const firstBooked = booked[0] || null;
  const firstWalkIn = walkins[0] || null;

  let chosen = null;
  let kind = null;
  let minutesToSlot = null;

  if (firstBooked) {
    const slotMs = slotToMs(
      firstBooked.slotDate,
      firstBooked.slotTime,
      firstBooked.date,
    );

    const minsTo = minutesCeilClamped(slotMs - nowMs);
    minutesToSlot = minsTo;

    if (minsTo <= BOOKED_PRIORITY_MINUTES) {
      chosen = firstBooked;
      kind = "BOOKED";
    } else if (firstWalkIn) {
      chosen = firstWalkIn;
      kind = "WALK_IN";
    } else {
      chosen = firstBooked;
      kind = "BOOKED";
    }
  } else if (firstWalkIn) {
    chosen = firstWalkIn;
    kind = "WALK_IN";
  }

  let next = null;

  if (chosen) {
    const isWalkIn = Boolean(chosen.isWalkIn);

    const minutesLeft = isWalkIn
      ? calcWalkInMinutesLeft(chosen, nowMs, { live, hasActive })
      : calcBookedMinutesLeft(chosen, nowMs, { live, hasActive });

    const dentistFree = !hasActive;
    let shouldCall = false;

    if (isWalkIn) {
      shouldCall = dentistFree;
    } else {
      const slotMs = slotToMs(chosen.slotDate, chosen.slotTime, chosen.date);
      const minsTo = minutesCeilClamped(slotMs - nowMs);
      shouldCall = dentistFree && minsTo <= BOOKED_CALL_MINUTES;
    }

    next = {
      appointmentId: chosen._id,
      slotDate: chosen.slotDate,
      slotTime: chosen.slotTime,
      isWalkIn,
      kind,
      minutesLeft,
      minutesToSlot: isWalkIn ? null : minutesToSlot,
      shouldCall,
      showInAdmin: isWalkIn
        ? minutesLeft <= WALKIN_MAX_WAIT_MINUTES
        : minutesLeft <= ADMIN_MAX_SHOW_MINUTES,
      user: chosen.userId || null,
    };
  }

  return {
    state,
    currentAppointmentId,
    lastFinishedAt: live?.lastFinishedAt || null,
    lastBusyAt: live?.lastBusyAt || null,
    next,
  };
};

export const expireWalkInAppointments = async () => {
  const now = Date.now();
  const WINDOW_MS = WALKIN_MAX_WAIT_MINUTES * 60 * 1000;

  const waitingWalkins = await appointmentModel
    .find({
      isWalkIn: true,
      status: "WAITING",
      cancelled: false,
    })
    .select("_id dentistID createdAt date")
    .lean();

  if (!waitingWalkins.length) return;

  const dentistIds = [
    ...new Set(waitingWalkins.map((x) => String(x.dentistID))),
  ];

  const lives = await dentistLiveStatusModel
    .find({ dentistID: { $in: dentistIds } })
    .select("dentistID state lastFinishedAt")
    .lean();

  const liveMap = new Map(lives.map((l) => [String(l.dentistID), l]));

  const idsToExpire = [];

  for (const a of waitingWalkins) {
    const dentistID = String(a.dentistID);
    const live = liveMap.get(dentistID) || {};

    if (live.state === "BUSY") continue;

    const createdMs = a.createdAt
      ? new Date(a.createdAt).getTime()
      : Number(a.date || 0);
    const lastFinishedAt = Number(live.lastFinishedAt || 0);

    let base = createdMs || now;
    if (lastFinishedAt && lastFinishedAt > base) {
      base = lastFinishedAt;
    }

    if (!Number.isFinite(base) || base <= 0) continue;

    if (base + WINDOW_MS <= now) {
      idsToExpire.push(a._id);
    }
  }

  if (idsToExpire.length) {
    await appointmentModel.updateMany(
      { _id: { $in: idsToExpire } },
      { $set: { status: "MISSED" } },
    );
  }

  const stuckLives = await dentistLiveStatusModel
    .find({
      state: "BUSY",
      reason: "WALK_IN_PENDING",
      currentAppointmentId: { $ne: null },
    })
    .select("dentistID currentAppointmentId reason state")
    .lean();

  if (!stuckLives.length) return;

  const limitMs = now - WINDOW_MS;

  for (const live of stuckLives) {
    const apptId = live.currentAppointmentId;
    const dentistID = live.dentistID;
    if (!apptId || !dentistID) continue;

    const a = await appointmentModel
      .findOne({ _id: apptId })
      .select("_id isWalkIn status cancelled createdAt date")
      .lean();

    if (!a) {
      await setAvailable(dentistID, { finishedAt: Date.now() });
      continue;
    }

    if (!a.isWalkIn) continue;

    if (a.cancelled) {
      await setAvailable(dentistID, { finishedAt: Date.now() });
      continue;
    }

    const createdMs = a.createdAt
      ? new Date(a.createdAt).getTime()
      : Number(a.date || 0);

    const olderThanWindow = createdMs && createdMs < limitMs;

    if (a.status === "MISSED" || a.status === "CANCELLED" || olderThanWindow) {
      await setAvailable(dentistID, { finishedAt: Date.now() });
    }
  }
};
