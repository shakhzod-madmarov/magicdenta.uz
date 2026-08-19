import crypto from "crypto";
import dentistModel from "../models/dentistModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import {
  formatUzDayKey,
  formatYMD,
  parseUzDateTimeToUtcDate,
} from "../../shared/date.js";
import {
  getOrthodontistQueueSnapshot,
  resolveOrthodontistDentist,
} from "../utils/orthodontistQueueService.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";

const BOOKED_PRIORITY_MINUTES = 10;
const BOOKED_CALL_MINUTES = 5;

const safeStr = (v) => String(v ?? "").trim();

const timingSafeEqualStr = (a, b) => {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
};

const maskPhone = (phoneRaw = "") => {
  const s = String(phoneRaw || "");
  const digits = s.replace(/\s+/g, "");
  if (digits.length <= 6) return "****";
  return `${digits.slice(0, 6)}*****${digits.slice(-2)}`;
};

const pickPatientSafe = (u) => {
  if (!u) return null;
  return {
    patientId: u.patientId || null,
    name: u.name || "—",
    phone: u.phone ? maskPhone(u.phone) : null,
  };
};

const hashSnapshot = (obj) => {
  return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex");
};

const slotToMs = (slotDate, slotTime, fallback = 0) => {
  const dt = parseUzDateTimeToUtcDate(slotDate, slotTime);
  const ms = dt ? dt.getTime() : Number(fallback || 0);
  return Number.isNaN(ms) ? Number(fallback || 0) : ms;
};

const minutesCeilClamped = (ms) => Math.max(0, Math.ceil(ms / 60000));

const buildOrthoPatientSafe = (u) => {
  if (!u) return null;
  return {
    patientId: u.patientId || null,
    name: u.name || "—",
    phone: u.phone ? maskPhone(u.phone) : null,
  };
};

const mapOrthoItem = (item) => ({
  queueNo: item.queueNo,
  appointmentId: item.appointmentId ? String(item.appointmentId) : null,
  orthoQueueId: String(item._id),
  status: item.status,
  slotDate: null,
  slotTime: null,
  isWalkIn: true,
  createdFrom: item.source || "TELEGRAM",
  createdAt: item.createdAt,
  patient: buildOrthoPatientSafe(item.patientId),
  kind: "ORTHO",
});

export const getPublicQueueSnapshot = async (req, res) => {
  try {
    const provided =
      safeStr(req.headers["x-screen-key"]) || safeStr(req.query?.key);

    const expected = safeStr(process.env.SCREEN_KEY);
    if (!expected) {
      return res.status(500).json({
        success: false,
        message: "SCREEN_KEY not configured",
      });
    }

    if (!provided || !timingSafeEqualStr(provided, expected)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const now = new Date();
    const today = formatYMD(now);
    const todayOrthoDayKey = formatUzDayKey();
    const nowMs = now.getTime();

    const dentists = await dentistModel
      .find({ isArchived: { $ne: true } })
      .select("_id name image speciality")
      .lean();

    const dentistIds = dentists.map((d) => d._id);

    // Waiting / next logic stays based on TODAY only.
    const allToday = await appointmentModel
      .find({
        dentistID: { $in: dentistIds },
        slotDate: today,
      })
      .sort({
        dentistID: 1,
        createdAt: 1,
        _id: 1,
      })
      .populate("userId", "name phone patientId")
      .lean();

    const groupedToday = new Map();
    for (const a of allToday) {
      const id = String(a.dentistID);
      if (!groupedToday.has(id)) groupedToday.set(id, []);
      groupedToday.get(id).push(a);
    }

    // Current regular appointment: ANY real IN_PROGRESS, even if started yesterday.
    const activeRegular = await appointmentModel
      .find({
        dentistID: { $in: dentistIds },
        cancelled: false,
        status: "IN_PROGRESS",
      })
      .sort({
        dentistID: 1,
        startedAt: -1,
        date: -1,
        createdAt: -1,
        _id: -1,
      })
      .populate("userId", "name phone patientId")
      .lean();

    const activeRegularByDentist = new Map();
    for (const a of activeRegular) {
      const key = String(a.dentistID);
      if (!activeRegularByDentist.has(key)) {
        activeRegularByDentist.set(key, a);
      }
    }

    // We need the queue number of the CURRENT appointment from its OWN queue day.
    const regularQueueDayKeys = new Set();
    for (const a of activeRegular) {
      if (a?.slotDate) {
        regularQueueDayKeys.add(
          `${String(a.dentistID)}__${String(a.slotDate)}`,
        );
      }
    }

    const regularQueueDayLists = new Map();
    for (const compound of regularQueueDayKeys) {
      const [dentistId, slotDate] = compound.split("__");

      const dayList = await appointmentModel
        .find({
          dentistID: dentistId,
          slotDate,
        })
        .sort({
          createdAt: 1,
          _id: 1,
        })
        .populate("userId", "name phone patientId")
        .lean();

      regularQueueDayLists.set(compound, dayList);
    }

    let orthoDentist = null;
    let orthoTodaySnapshot = null;

    try {
      orthoDentist = await resolveOrthodontistDentist();
      if (orthoDentist?._id) {
        orthoTodaySnapshot = await getOrthodontistQueueSnapshot({
          dentistId: orthoDentist._id,
          dayKey: todayOrthoDayKey,
        });
      }
    } catch {
      orthoDentist = null;
      orthoTodaySnapshot = null;
    }

    // Current ortho appointment: latest real IN_PROGRESS across ANY ortho day
    let orthoCurrentAnyDay = null;
    if (orthoDentist?._id) {
      orthoCurrentAnyDay = await orthodontistQueueModel
        .findOne({
          dentistId: orthoDentist._id,
          status: "IN_PROGRESS",
        })
        .sort({
          doneAt: -1,
          createdAt: -1,
          _id: -1,
        })
        .populate("patientId", "name phone patientId")
        .lean();
    }

    const dentistQueueCards = dentists.map((d) => {
      const dentistId = String(d._id);
      const isOrthodontistDisplayDentist =
        orthoDentist && dentistId === String(orthoDentist._id);

      if (isOrthodontistDisplayDentist) {
        const activeTodayOrtho =
          orthoTodaySnapshot?.items
            ?.filter((x) =>
              ["WAITING", "CALLED", "IN_PROGRESS"].includes(x.status),
            )
            .sort((a, b) => a.queueNo - b.queueNo) || [];

        const currentOrtho = orthoCurrentAnyDay
          ? mapOrthoItem(orthoCurrentAnyDay)
          : null;

        const calledOrtho =
          activeTodayOrtho.find((x) => x.status === "CALLED") || null;

        const nextOrtho = currentOrtho
          ? activeTodayOrtho.find((x) => x.status === "WAITING") || null
          : calledOrtho ||
            activeTodayOrtho.find((x) => x.status === "WAITING") ||
            null;

        const next = nextOrtho
          ? {
              ...mapOrthoItem(nextOrtho),
              shouldCall: nextOrtho.status === "CALLED",
            }
          : null;

        return {
          dentist: {
            id: dentistId,
            name: d.name,
            image: d.image || "",
            speciality: d.speciality || [],
          },
          current: currentOrtho,
          next,
          upcomingBooked: null,
          top7: activeTodayOrtho.slice(0, 7).map(mapOrthoItem),
          total: activeTodayOrtho.length,
        };
      }

      const listToday = groupedToday.get(dentistId) || [];

      // TODAY queue map -> used for today's waiting/next only
      const todayQueueMap = new Map();
      listToday.forEach((a, index) => {
        todayQueueMap.set(String(a._id), index + 1);
      });

      const waitingToday = listToday
        .filter((a) => !a.cancelled && a.status === "WAITING")
        .slice()
        .sort((a, b) => {
          const qa = todayQueueMap.get(String(a._id)) || 0;
          const qb = todayQueueMap.get(String(b._id)) || 0;
          return qa - qb;
        })
        .map((a) => ({
          queueNo: todayQueueMap.get(String(a._id)),
          appointmentId: String(a._id),
          status: a.status,
          slotDate: a.slotDate,
          slotTime: a.slotTime,
          isWalkIn: Boolean(a.isWalkIn),
          createdFrom: a.createdFrom || "USER",
          createdAt: a.createdAt,
          slotMs: slotToMs(a.slotDate, a.slotTime, a.date),
          patient: pickPatientSafe(a.userId),
        }));

      // CURRENT queue number -> use the queue day of the current appointment itself
      const currentRaw = activeRegularByDentist.get(dentistId) || null;

      let current = null;
      if (currentRaw) {
        const currentSlotDate = String(currentRaw.slotDate || "");
        const compound = `${dentistId}__${currentSlotDate}`;
        const queueDayList = regularQueueDayLists.get(compound) || [];
        const queueDayMap = new Map();

        queueDayList.forEach((a, index) => {
          queueDayMap.set(String(a._id), index + 1);
        });

        current = {
          queueNo: queueDayMap.get(String(currentRaw._id)) || null,
          appointmentId: String(currentRaw._id),
          status: currentRaw.status,
          slotDate: currentRaw.slotDate,
          slotTime: currentRaw.slotTime,
          isWalkIn: Boolean(currentRaw.isWalkIn),
          createdFrom: currentRaw.createdFrom || "USER",
          createdAt: currentRaw.createdAt,
          startedAt: currentRaw.startedAt || currentRaw.updatedAt || null,
          patient: pickPatientSafe(currentRaw.userId),
        };
      }

      const dentistFree = !current;

      const bookedWaiting = waitingToday
        .filter((x) => !x.isWalkIn)
        .sort((a, b) => {
          if (a.slotMs !== b.slotMs) return a.slotMs - b.slotMs;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

      const walkinWaiting = waitingToday
        .filter((x) => x.isWalkIn)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const firstBooked = bookedWaiting[0] || null;
      const firstWalkIn = walkinWaiting[0] || null;

      let next = null;
      let upcomingBooked = null;

      if (firstBooked) {
        const minsTo = minutesCeilClamped((firstBooked.slotMs || 0) - nowMs);

        upcomingBooked = {
          appointmentId: firstBooked.appointmentId,
          queueNo: firstBooked.queueNo,
          slotDate: firstBooked.slotDate,
          slotTime: firstBooked.slotTime,
          minutesToSlot: minsTo,
          patient: firstBooked.patient,
        };

        const canCallBooked = dentistFree && minsTo <= BOOKED_CALL_MINUTES;
        const isBookedWindow = minsTo <= BOOKED_PRIORITY_MINUTES;

        if (isBookedWindow) {
          next = {
            ...firstBooked,
            minutesToSlot: minsTo,
            shouldCall: canCallBooked,
            kind: "BOOKED",
          };
        } else if (firstWalkIn) {
          next = {
            ...firstWalkIn,
            shouldCall: dentistFree,
            kind: "WALK_IN",
          };
        } else {
          next = null;
        }
      } else if (firstWalkIn) {
        next = {
          ...firstWalkIn,
          shouldCall: dentistFree,
          kind: "WALK_IN",
        };
      }

      const strip = (x) => {
        if (!x) return null;
        const out = { ...x };
        delete out.slotMs;
        return out;
      };

      return {
        dentist: {
          id: dentistId,
          name: d.name,
          image: d.image || "",
          speciality: d.speciality || [],
        },
        current: strip(current),
        next: strip(next),
        upcomingBooked,
        top7: (current ? [current, ...waitingToday] : waitingToday)
          .slice(0, 7)
          .map(strip),
        total: (current ? [current, ...waitingToday] : waitingToday).length,
      };
    });

    const payload = {
      success: true,
      day: today,
      serverTimeMs: nowMs,
      dentists: dentistQueueCards,
    };

    return res.json({
      ...payload,
      snapshotHash: hashSnapshot(payload),
    });
  } catch (e) {
    console.error("public queue error:", e);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
