import express from "express";
import authDentist from "../middlewares/authDentist.js";
import {
  uploadDentistAvatar,
  uploadXrays,
  uploadPatientAvatar,
} from "../middlewares/multer.js";
import { loginLimiter } from "../middlewares/security.js";

import {
  dentistList,
  dentistLogin,
  dentistProfile,
  dentistChangePassword,
  updateDentistProfile,
  dentistAppointments,
  checkoutVisit,
  getDentistNotifications,
  markDentistNotificationRead,
  dentistStartAppointment,
  dentistPatients,
  dentistPatientHistory,
  dentistEarningsOverview,
  payAppointmentDebt,
  dentistDashboardStats,
  dentistCreatePatient,
  dentistUpdatePatientInfectiousDiseaseMarkers,
  dentistVerifyPatientInfectiousDiseaseAccess,
  dentistCalendarAvailability,
  dentistCreateManualAppointment,
  dentistCancelAppointment,
  dentistRescheduleAppointment,
  dentistGetWarehouseItems,
  dentistStockOutItem,
  dentistGetMyFinanceOverview,
  dentistUpdatePatient,
  dentistMyWarehouseItems,
  dentistMyWarehouseAddItem,
  dentistMyWarehouseUpdateItem,
  dentistMyWarehouseDeleteItem,
  dentistMyWarehouseStockIn,
  dentistMyWarehouseStockOut,
  dentistMyWarehouseLogs,
  dentistAvailableSlots,
  getDentistMySchedule,
  updateDentistMySchedule,
  dentistAddPatientHistoricalTreatment,
} from "../controllers/dentistController.js";
import {
  dentistTemplates,
  dentistCreateTemplate,
  dentistUpdateTemplate,
  dentistDeleteTemplate,
} from "../controllers/templateController.js";

import {
  dentistGetMyWorkStatus,
  dentistFinishCurrent,
  dentistAssignWalkIn,
  dentistLookupPatient,
} from "../controllers/liveStatusController.js";

import {
  dentistGetOrthodontistQueue,
  dentistUpdateOrthodontistQueueStatus,
  dentistConvertOrthodontistQueueToVisit,
  dentistCompleteOrthodontistQueue,
} from "../controllers/orthodontistQueueController.js";

import {
  dentistCreateTelegramLink,
  dentistCheckTelegramLink,
  dentistUnlinkTelegram,
  adminCreatePatientTelegramLink,
  adminCheckPatientTelegramLink,
  adminUnlinkPatientTelegram,
} from "../controllers/telegramController.js";

const dentistRouter = express.Router();

dentistRouter.get("/list", dentistList);
dentistRouter.post("/login", loginLimiter, dentistLogin);

dentistRouter.get("/profile", authDentist, dentistProfile);
dentistRouter.post(
  "/profile",
  authDentist,
  uploadDentistAvatar.single("image"),
  updateDentistProfile,
);

dentistRouter.post("/profile/telegram-link", authDentist, dentistCreateTelegramLink);
dentistRouter.get("/profile/telegram-check", authDentist, dentistCheckTelegramLink);
dentistRouter.post("/profile/telegram-unlink", authDentist, dentistUnlinkTelegram);
dentistRouter.get("/profile/schedule", authDentist, getDentistMySchedule);
dentistRouter.post("/profile/schedule", authDentist, updateDentistMySchedule);
dentistRouter.post(
  "/patients/:id/infectious-diseases/verify-access",
  authDentist,
  dentistVerifyPatientInfectiousDiseaseAccess,
);
dentistRouter.put(
  "/patients/:id/infectious-diseases",
  authDentist,
  dentistUpdatePatientInfectiousDiseaseMarkers,
);
dentistRouter.post("/change-password", authDentist, dentistChangePassword);
dentistRouter.put("/change-password", authDentist, dentistChangePassword);

dentistRouter.get("/appointments", authDentist, dentistAppointments);
dentistRouter.post("/visit/start", authDentist, dentistStartAppointment);

dentistRouter.get("/patients", authDentist, dentistPatients);
dentistRouter.get(
  "/patient-history/:userId",
  authDentist,
  dentistPatientHistory,
);
dentistRouter.post(
  "/patients/create",
  authDentist,
  uploadPatientAvatar.single("image"),
  dentistCreatePatient,
);

dentistRouter.get("/templates", authDentist, dentistTemplates);
dentistRouter.post("/templates", authDentist, dentistCreateTemplate);
dentistRouter.put("/templates/:id", authDentist, dentistUpdateTemplate);
dentistRouter.delete("/templates/:id", authDentist, dentistDeleteTemplate);

dentistRouter.get("/earnings-overview", authDentist, dentistEarningsOverview);
dentistRouter.post("/pay-debt", authDentist, payAppointmentDebt);

dentistRouter.get("/dashboard-stats", authDentist, dentistDashboardStats);

dentistRouter.post("/checkout", authDentist, uploadXrays, checkoutVisit);

dentistRouter.post(
  "/checkout/:id",
  authDentist,
  uploadXrays,
  (req, _res, next) => {
    if (!req.body?.appointmentId) req.body.appointmentId = req.params.id;
    next();
  },
  checkoutVisit,
);

dentistRouter.get("/notifications", authDentist, getDentistNotifications);
dentistRouter.post(
  "/notifications/read/:id",
  authDentist,
  markDentistNotificationRead,
);
dentistRouter.get("/patients/lookup", authDentist, dentistLookupPatient);
dentistRouter.post("/walkin/assign", authDentist, dentistAssignWalkIn);

dentistRouter.get("/work-status", authDentist, dentistGetMyWorkStatus);
dentistRouter.post("/visit/finish", authDentist, dentistFinishCurrent);

dentistRouter.get(
  "/orthodontist-queue",
  authDentist,
  dentistGetOrthodontistQueue,
);
dentistRouter.post(
  "/orthodontist-queue/:id/status",
  authDentist,
  dentistUpdateOrthodontistQueueStatus,
);
dentistRouter.post(
  "/orthodontist-queue/:id/convert-to-visit",
  authDentist,
  dentistConvertOrthodontistQueueToVisit,
);
dentistRouter.post(
  "/orthodontist-queue/:id/complete",
  authDentist,
  uploadXrays,
  dentistCompleteOrthodontistQueue,
);

dentistRouter.get("/calendar-availability", authDentist, dentistCalendarAvailability);
dentistRouter.post("/manual-appointments", authDentist, dentistCreateManualAppointment);
dentistRouter.post("/appointments/:id/cancel", authDentist, dentistCancelAppointment);
dentistRouter.post("/appointments/:id/reschedule", authDentist, dentistRescheduleAppointment);

// Dentist Finance & Warehouse integration
dentistRouter.get("/finance/overview", authDentist, dentistGetMyFinanceOverview);
dentistRouter.get("/warehouse/items", authDentist, dentistGetWarehouseItems);
dentistRouter.post("/warehouse/items/:id/stock-out", authDentist, dentistStockOutItem);

// Dentist: patient telegram link (reuse admin handlers — auth checked via authDentist)
dentistRouter.post("/patients/:id/telegram-link", authDentist, adminCreatePatientTelegramLink);
dentistRouter.get("/patients/:id/telegram-check", authDentist, adminCheckPatientTelegramLink);
dentistRouter.post("/patients/:id/telegram-unlink", authDentist, adminUnlinkPatientTelegram);

// Dentist: update patient info
dentistRouter.put("/patients/:id", authDentist, dentistUpdatePatient);
dentistRouter.post(
  "/patients/:id/historical-treatment",
  authDentist,
  uploadXrays,
  dentistAddPatientHistoricalTreatment
);

// ── Dentist Personal Warehouse (own items, separate from clinic stock) ────────
dentistRouter.get("/my-warehouse/items", authDentist, dentistMyWarehouseItems);
dentistRouter.post("/my-warehouse/items", authDentist, dentistMyWarehouseAddItem);
dentistRouter.put("/my-warehouse/items/:id", authDentist, dentistMyWarehouseUpdateItem);
dentistRouter.delete("/my-warehouse/items/:id", authDentist, dentistMyWarehouseDeleteItem);
dentistRouter.post("/my-warehouse/items/:id/stock-in", authDentist, dentistMyWarehouseStockIn);
dentistRouter.post("/my-warehouse/items/:id/stock-out", authDentist, dentistMyWarehouseStockOut);
dentistRouter.get("/my-warehouse/logs", authDentist, dentistMyWarehouseLogs);

// Available time slots for a date (for next visit picker)
dentistRouter.get("/appointments/available-slots", authDentist, dentistAvailableSlots);

export default dentistRouter;
