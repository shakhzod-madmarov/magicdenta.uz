import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import orthodontistQueueModel from "../models/orthodontistQueueModel.js";
import commissionPayoutModel from "../models/commissionPayoutModel.js";
import expenseModel from "../models/expenseModel.js";
import activityLogModel from "../models/activityLogModel.js";
import appointmentReminderLogModel from "../models/appointmentReminderLogModel.js";
import orthodontistFollowUpReminderLogModel from "../models/orthodontistFollowUpReminderLogModel.js";
import appointmentSlotLockModel from "../models/appointmentSlotLockModel.js";
import telegramEventLogModel from "../models/telegramEventLogModel.js";
import notificationModel from "../models/notificationModel.js";
import counterModel from "../models/counterModel.js";
import dentistModel from "../models/dentistModel.js";
import dentistLiveStatusModel from "../models/dentistLiveStatusModel.js";

const resetData = async () => {
  // Safety fallback exit after 15s max
  const killTimer = setTimeout(() => {
    console.log("⏱ Force exiting reset script after timeout.");
    process.exit(0);
  }, 15000);

  try {
    const mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGODB_DB || "magicdenta_dev";

    console.log("Connecting to MongoDB:", mongodbUri, "DB:", dbName);
    
    let connectUri = mongodbUri;
    if (!connectUri.includes("?") && !connectUri.endsWith("/")) {
      connectUri = `${mongodbUri}/${dbName}`;
    }
    
    await mongoose.connect(connectUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected successfully to MongoDB.");

    console.log("\n--- Counting current records ---");
    const countsBefore = {
      patients: await userModel.countDocuments(),
      appointments: await appointmentModel.countDocuments(),
      treatments: await treatmentModel.countDocuments(),
      orthoQueue: await orthodontistQueueModel.countDocuments(),
      commissionPayouts: await commissionPayoutModel.countDocuments(),
      expenses: await expenseModel.countDocuments(),
      activityLogs: await activityLogModel.countDocuments(),
      appointmentReminderLogs: await appointmentReminderLogModel.countDocuments(),
      orthoReminderLogs: await orthodontistFollowUpReminderLogModel.countDocuments(),
      slotLocks: await appointmentSlotLockModel.countDocuments(),
      telegramLogs: await telegramEventLogModel.countDocuments(),
      notifications: await notificationModel.countDocuments(),
      counters: await counterModel.countDocuments(),
      dentists: await dentistModel.countDocuments(),
    };

    console.log("Before reset:", countsBefore);

    console.log("\n--- Deleting patient, appointment, payment & queue records ---");
    const delPatients = await userModel.deleteMany({});
    console.log(`Deleted Patients (users): ${delPatients.deletedCount}`);

    const delAppointments = await appointmentModel.deleteMany({});
    console.log(`Deleted Appointments: ${delAppointments.deletedCount}`);

    const delTreatments = await treatmentModel.deleteMany({});
    console.log(`Deleted Treatments: ${delTreatments.deletedCount}`);

    const delOrthoQueue = await orthodontistQueueModel.deleteMany({});
    console.log(`Deleted Orthodontist Queue: ${delOrthoQueue.deletedCount}`);

    const delPayouts = await commissionPayoutModel.deleteMany({});
    console.log(`Deleted Commission Payouts: ${delPayouts.deletedCount}`);

    const delExpenses = await expenseModel.deleteMany({});
    console.log(`Deleted Expenses: ${delExpenses.deletedCount}`);

    const delActLogs = await activityLogModel.deleteMany({});
    console.log(`Deleted Activity Logs: ${delActLogs.deletedCount}`);

    const delAppRem = await appointmentReminderLogModel.deleteMany({});
    console.log(`Deleted Appointment Reminder Logs: ${delAppRem.deletedCount}`);

    const delOrthoRem = await orthodontistFollowUpReminderLogModel.deleteMany({});
    console.log(`Deleted Ortho Reminder Logs: ${delOrthoRem.deletedCount}`);

    const delLocks = await appointmentSlotLockModel.deleteMany({});
    console.log(`Deleted Slot Locks: ${delLocks.deletedCount}`);

    const delTgLogs = await telegramEventLogModel.deleteMany({});
    console.log(`Deleted Telegram Event Logs: ${delTgLogs.deletedCount}`);

    const delNotifs = await notificationModel.deleteMany({});
    console.log(`Deleted Notifications: ${delNotifs.deletedCount}`);

    const delCounters = await counterModel.deleteMany({});
    console.log(`Deleted ID Counters: ${delCounters.deletedCount}`);

    console.log("\n--- Resetting Dentist booked slots & live statuses ---");
    const updateDentists = await dentistModel.updateMany({}, { $set: { slots_booked: {} } });
    console.log(`Reset slots_booked for ${updateDentists.modifiedCount} dentists.`);

    const updateLiveStatus = await dentistLiveStatusModel.updateMany(
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
    console.log(`Reset live status for ${updateLiveStatus.modifiedCount} dentist statuses.`);

    console.log("\n--- Verifying Dentists Data ---");
    const dentistsRemaining = await dentistModel.find({}).select("name email phone patientId").lean();
    console.log(`Dentists safely preserved: ${dentistsRemaining.length}`);
    dentistsRemaining.forEach((d) => {
      console.log(`  - Dr. ${d.name} (${d.email} / ${d.phone})`);
    });

    console.log("\n✅ Data cleanup successfully completed!");
    clearTimeout(killTimer);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting data:", error);
    clearTimeout(killTimer);
    process.exit(1);
  }
};

resetData();
