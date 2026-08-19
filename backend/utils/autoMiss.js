import appointmentModel from "../models/appointmentsModel.js";
import dentistLiveStatusModel from "../models/dentistLiveStatusModel.js";

const GRACE_MINUTES = 15;
const GRACE_MS = GRACE_MINUTES * 60 * 1000;

export const autoMissForDentist = async (dentistID) => {
  const now = Date.now();
  if (!dentistID) return { ok: false, message: "dentistID required" };

  const active = await appointmentModel
    .findOne({ dentistID, status: "IN_PROGRESS", cancelled: false })
    .select("_id")
    .lean();

  if (active) return { ok: true, skipped: "BUSY", changed: 0 };

  const st = await dentistLiveStatusModel
    .findOne({ dentistID })
    .select("lastFinishedAt")
    .lean();

  const lastFinishedAt = Number(st?.lastFinishedAt || 0);

  let changed = 0;

  for (let i = 0; i < 5; i++) {
    const next = await appointmentModel
      .findOne({
        dentistID,
        status: "WAITING",
        cancelled: false,
        isWalkIn: { $ne: true }, 
      })
      .sort({ date: 1 })
      .select("_id date")
      .lean();

    if (!next) break;

    const effectiveStart = Math.max(Number(next.date || 0), lastFinishedAt);

    if (now <= effectiveStart + GRACE_MS) break;

    const r = await appointmentModel.updateOne(
      { _id: next._id, status: "WAITING", cancelled: false },
      { $set: { status: "MISSED" } },
    );

    if (r?.modifiedCount) changed += 1;
    else break;
  }

  return { ok: true, changed };
};

export const autoMissAllDentists = async () => {
  const dentistIds = await appointmentModel.distinct("dentistID", {
    status: "WAITING",
    cancelled: false,
    isWalkIn: { $ne: true },
  });

  let processed = 0;

  for (const dentistID of dentistIds) {
    try {
      await autoMissForDentist(dentistID);
      processed += 1;
    } catch (e) {
      console.error("autoMissForDentist failed:", dentistID, e?.message);
    }
  }

  return { ok: true, dentists: processed };
};
