import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import authAdminOrDentist from "../middlewares/authAdminOrDentist.js";
import {
  uploadDentistAvatar,
  uploadPatientAvatar,
  uploadXrays,
} from "../middlewares/multer.js";
import { loginLimiter } from "../middlewares/security.js";

import {
  loginAdmin,
  addDentist,
  allDentists,
  changeDentistAvailability,
  adminGetAllAppointments,
  pendingTreatments,
  paymentRequests,
  confirmTreatmentPayment,
  getAdminStats,
  getInvoice,
  notifyPatient,
  debtReportByPatient,
  adminPatientsList,
  adminPatientDetails,
  adminCreatePatient,
  adminUpdatePatient,
  adminUpdatePatientInfectiousDiseaseMarkers,
  adminDentistDetails,
  adminUpdateDentist,
  setDentistArchived,
  adminConfirmArrival,
  adminVerifyPatientInfectiousDiseaseAccess,
  adminChangeTreatmentAmount,
  adminCalendarAvailability,
  adminCreateManualAppointment,
  adminCancelAppointment,
  adminRescheduleAppointment,
  getAdminPayrollReport,
  payDentistCommission,
  getAdminExpenses,
  createAdminExpense,
  deleteAdminExpense,
  adminUpdateDentistCommission,
  verifyAdminOrDentistPassword,
  verifyAdminAndDentistPassword,
  getAdminSettings,
  updateTelegramSettings,
  getClinicSchedule,
  updateClinicSchedule,
  getDentistScheduleForAdmin,
  updateDentistScheduleByAdmin,
  resetPatientDataController,
  adminFixExaggeratedAmount,
  adminGetContactMessages,
  adminUpdateContactStatus,
  adminAddPatientHistoricalTreatment,
} from "../controllers/adminController.js";

import {
  createWarehouseItem,
  getWarehouseItems,
  stockInItem,
  stockOutItem,
  getWarehouseLogs,
} from "../controllers/warehouseController.js";

import {
  adminAssignWalkIn,
  adminGetDentistsLiveStatus,
  adminLookupPatient,
} from "../controllers/liveStatusController.js";

import {
  adminGetOrthodontistQueue,
  adminUpdateOrthodontistQueueStatus,
} from "../controllers/orthodontistQueueController.js";

import {
  adminCreatePatientTelegramLink,
  adminCheckPatientTelegramLink,
  adminUnlinkPatientTelegram,
  adminCreateDentistTelegramLink,
  adminCheckDentistTelegramLink,
  adminUnlinkDentistTelegram,
  adminSendDebtTelegramReminder,
} from "../controllers/telegramController.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginLimiter, loginAdmin);

adminRouter.get("/dentists/live-status", authAdmin, adminGetDentistsLiveStatus);
adminRouter.post("/walkin/assign", authAdmin, adminAssignWalkIn);
adminRouter.get("/patients/lookup", authAdmin, adminLookupPatient);
adminRouter.get("/calendar-availability", authAdmin, adminCalendarAvailability);
adminRouter.post("/manual-appointments", authAdmin, adminCreateManualAppointment);

adminRouter.post(
  "/add-dentist",
  authAdmin,
  uploadDentistAvatar.single("image"),
  addDentist,
);
adminRouter.get("/all-dentists", authAdmin, allDentists);
adminRouter.post("/change-availability", authAdmin, changeDentistAvailability);
adminRouter.get("/dentists/:id", authAdmin, adminDentistDetails);
adminRouter.post(
  "/dentists/:id",
  authAdmin,
  uploadDentistAvatar.single("image"),
  adminUpdateDentist,
);
adminRouter.post("/dentists/:id/archive", authAdmin, setDentistArchived);

adminRouter.post("/dentists/:id/telegram-link", authAdmin, adminCreateDentistTelegramLink);
adminRouter.get("/dentists/:id/telegram-check", authAdmin, adminCheckDentistTelegramLink);
adminRouter.post("/dentists/:id/telegram-unlink", authAdmin, adminUnlinkDentistTelegram);

adminRouter.put(
  "/dentists/:id",
  authAdmin,
  uploadDentistAvatar.single("image"),
  adminUpdateDentist,
);

adminRouter.get("/appointments", authAdmin, adminGetAllAppointments);
adminRouter.get(
  "/appointments/pending-treatments",
  authAdmin,
  pendingTreatments,
);
adminRouter.post(
  "/appointments/confirm-arrival",
  authAdmin,
  adminConfirmArrival,
);
adminRouter.post(
  "/appointments/:id/cancel",
  authAdmin,
  adminCancelAppointment,
);
adminRouter.post(
  "/appointments/:id/reschedule",
  authAdmin,
  adminRescheduleAppointment,
);
adminRouter.get("/appointments/payment-requests", authAdmin, paymentRequests);
adminRouter.post(
  "/confirm-treatment-payment/:id",
  authAdmin,
  confirmTreatmentPayment,
);
adminRouter.post(
  "/change-treatment-amount/:id",
  authAdmin,
  adminChangeTreatmentAmount,
);

adminRouter.post("/treatments/:id/remind-debt", authAdmin, adminSendDebtTelegramReminder);

adminRouter.get("/payment-requests", authAdmin, paymentRequests);
adminRouter.get("/pending-treatments", authAdmin, pendingTreatments);

adminRouter.get("/stats", authAdmin, getAdminStats);
adminRouter.get("/invoice/:id", authAdmin, getInvoice);

adminRouter.get("/debts/by-patient/:id", authAdmin, debtReportByPatient);

adminRouter.post("/notify/:id", authAdmin, notifyPatient);

adminRouter.get("/patients", authAdmin, adminPatientsList);
adminRouter.get("/patients/:id", authAdmin, adminPatientDetails);
adminRouter.post(
  "/patients/create",
  authAdmin,
  uploadPatientAvatar.single("image"),
  adminCreatePatient,
);
adminRouter.put("/patients/:id", authAdmin, adminUpdatePatient);
adminRouter.post(
  "/patients/:id/historical-treatment",
  authAdmin,
  uploadXrays,
  adminAddPatientHistoricalTreatment
);

adminRouter.post(
  "/patients/:id/infectious-diseases/verify-access",
  authAdmin,
  adminVerifyPatientInfectiousDiseaseAccess,
);

adminRouter.put(
  "/patients/:id/infectious-diseases",
  authAdmin,
  adminUpdatePatientInfectiousDiseaseMarkers,
);

adminRouter.post("/patients/:id/telegram-link", authAdminOrDentist, adminCreatePatientTelegramLink);
adminRouter.get("/patients/:id/telegram-check", authAdminOrDentist, adminCheckPatientTelegramLink);
adminRouter.post("/patients/:id/telegram-unlink", authAdminOrDentist, adminUnlinkPatientTelegram);

adminRouter.get("/orthodontist-queue", authAdmin, adminGetOrthodontistQueue);

adminRouter.post(
  "/orthodontist-queue/:id/status",
  authAdmin,
  adminUpdateOrthodontistQueueStatus,
);

// Settings, Payroll, Expenses, Warehouse routes
adminRouter.get("/settings", authAdmin, getAdminSettings);
adminRouter.post("/settings/telegram", authAdmin, updateTelegramSettings);
adminRouter.get("/settings/clinic-schedule", authAdmin, getClinicSchedule);
adminRouter.post("/settings/clinic-schedule", authAdmin, updateClinicSchedule);
adminRouter.get("/dentists/:id/schedule", authAdmin, getDentistScheduleForAdmin);
adminRouter.post("/dentists/:id/schedule", authAdmin, updateDentistScheduleByAdmin);

adminRouter.get("/payroll/report", authAdmin, getAdminPayrollReport);
adminRouter.post("/payroll/payout", authAdmin, payDentistCommission);
adminRouter.post("/dentists/:id/commission", authAdmin, adminUpdateDentistCommission);

adminRouter.get("/expenses", authAdmin, getAdminExpenses);
adminRouter.post("/expenses", authAdmin, createAdminExpense);
adminRouter.delete("/expenses/:id", authAdmin, deleteAdminExpense);

adminRouter.get("/warehouse/items", authAdmin, getWarehouseItems);
adminRouter.post("/warehouse/items", authAdmin, createWarehouseItem);
adminRouter.post("/warehouse/items/:id/stock-in", authAdmin, stockInItem);
adminRouter.post("/warehouse/items/:id/stock-out", authAdmin, stockOutItem);
adminRouter.get("/warehouse/logs", authAdmin, getWarehouseLogs);

adminRouter.post("/verify-password/admin-or-dentist", authAdmin, verifyAdminOrDentistPassword);
adminRouter.post("/verify-password/admin-and-dentist", authAdmin, verifyAdminAndDentistPassword);

adminRouter.post("/reset-patient-data", authAdmin, resetPatientDataController);
adminRouter.post("/fix-zarnigor-amount", authAdmin, adminFixExaggeratedAmount);

adminRouter.get("/contact-messages", authAdmin, adminGetContactMessages);
adminRouter.put("/contact-messages/:id/status", authAdmin, adminUpdateContactStatus);

export default adminRouter;
