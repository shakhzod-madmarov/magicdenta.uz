import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMyTreatments,
  getAvailability,
} from "../controllers/userController.js";
import {
  claimAccountByIdAndDob,
  resetForgottenPassword,
} from "../controllers/userClaimController.js";
import {
  createTelegramLinkToken,
  getTelegramStatus,
  unlinkTelegram,
} from "../controllers/telegramController.js";

import authUser from "../middlewares/authUser.js";
import { uploadPatientAvatar } from "../middlewares/multer.js";
import { loginLimiter } from "../middlewares/security.js";

const userRouter = express.Router();

userRouter.post("/register", loginLimiter, uploadPatientAvatar.single("image"), registerUser);

userRouter.post("/login", loginLimiter, loginUser);

userRouter.get("/profile", authUser, getUserProfile);
userRouter.post(
  "/profile",
  authUser,
  uploadPatientAvatar.single("image"),
  updateUserProfile,
);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/my-appointments", authUser, getMyAppointments);
userRouter.post("/cancel-appointment/:id", authUser, cancelAppointment);

userRouter.get("/my-treatments", authUser, getMyTreatments);

userRouter.get("/availability", getAvailability);

userRouter.post("/claim/by-id-dob", loginLimiter, claimAccountByIdAndDob);
userRouter.post("/forgot-password", loginLimiter, resetForgottenPassword);

userRouter.get("/telegram/status", authUser, getTelegramStatus);
userRouter.post("/telegram/link-token", authUser, createTelegramLinkToken);
userRouter.post("/telegram/unlink", authUser, unlinkTelegram);

export default userRouter;
