import {
  prepareImageForJpegStorage,
  writePreparedImageToFile,
} from "../utils/sanitizeImage.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel.js";
import dentistModel from "../models/dentistModel.js";
import appointmentModel from "../models/appointmentsModel.js";
import treatmentModel from "../models/treatmentModel.js";
import {
  createAppointmentSafe,
  releaseLocksByAppointment,
  getAvailabilityForDentist,
} from "../utils/schedule.js";
import { normalizePhone } from "../utils/phone.js";

import path from "path";
import {
  ensureDir,
  deletePublicFileByUrl,
  buildPatientImageFileName,
} from "../utils/files.js";



const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, gender, DOB } = req.body;
    let address = req.body.address;

    if (!name || !phone || !password || !DOB) {
      return res.json({
        success: false,
        message: "Majburiy maydonlar to‘ldirilmagan",
      });
    }

    const emailNormalized = userModel.normalizeOptionalEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.json({ success: false, message: "Telefon noto‘g‘ri" });
    }

    if (emailNormalized && !validator.isEmail(emailNormalized)) {
      return res.json({ success: false, message: "Email noto‘g‘ri" });
    }

    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        address = {};
      }
    }

    const normalizedGender =
      gender && ["Erkak", "Ayol", "Tanlanmagan"].includes(gender)
        ? gender
        : "Tanlanmagan";

   const sameIdentityUsers = await userModel.findUsersByIdentity({
  name,
  DOB,
  select: "patientId name DOB email phone needsPasswordSet isActivated",
});

    const pendingMatch = sameIdentityUsers.find((user) => user.needsPasswordSet);
    if (pendingMatch) {
      return res.json({
        success: false,
        code: "NEEDS_ACTIVATION",
        patientId: pendingMatch.patientId,
        message:
          "Siz uchun admin yoki shifokor tomonidan akkaunt yaratilgan. Akkauntni faollashtiring.",
      });
    }

    const activeMatch = sameIdentityUsers.find((user) => !user.needsPasswordSet);
    if (activeMatch) {
      return res.json({
        success: false,
        message: "Shu bemor allaqachon ro‘yxatdan o‘tgan. Iltimos, login qiling.",
      });
    }

    const capacity = await userModel.checkSharedContactCapacity({
      phone: normalizedPhone,
      email: emailNormalized,
    });

    if (!capacity.ok) {
      return res.json({ success: false, message: capacity.message });
    }

    const hashed = await bcrypt.hash(String(password), 10);

    const preparedPatientImage = req.file?.buffer
      ? await prepareImageForJpegStorage(req.file.buffer, {
          originalName: req.file.originalname,
        })
      : null;

    const user = await userModel.create({
      name: String(name).trim(),
      email: emailNormalized || undefined,
      phone: normalizedPhone,
      password: hashed,
      address: address || { line1: "", line2: "" },
      gender: normalizedGender,
      DOB: String(DOB),
      needsPasswordSet: false,
      isActivated: true,
    });

    if (req.file && req.file.buffer) {
      const fileName = buildPatientImageFileName({
        patientId: user.patientId || String(user._id),
        patientName: user.name,
        ext: ".jpg",
      });

      const targetDir = path.join(process.cwd(), "uploads", "public", "patients");
      ensureDir(targetDir);

      const absPath = path.join(targetDir, fileName);
      await writePreparedImageToFile(preparedPatientImage, absPath);

      user.image = `/uploads/patients/${fileName}`;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        patientId: user.patientId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        gender: user.gender,
        DOB: user.DOB,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password, nameOrEmail, DOB } = req.body || {};

    if (!emailOrPhone || !password) {
      return res.json({ success: false, message: "Ma’lumotlar yetarli emas" });
    }

    const credential = String(emailOrPhone).trim();
    const loginHint = String(nameOrEmail || "").trim();
    const loginDob = userModel.normalizeDateOnly(DOB);
    let users = [];

    if (validator.isEmail(credential)) {
      users = await userModel
        .find({ email: userModel.normalizeOptionalEmail(credential) })
        .select(
          "+password needsPasswordSet isActivated name email DOB phone patientId",
        );
    } else {
      const normalizedPhone = normalizePhone(credential);
      if (!normalizedPhone) {
        return res.json({ success: false, message: "Telefon noto‘g‘ri" });
      }

      users = await userModel
        .find({ phone: normalizedPhone })
        .select(
          "+password needsPasswordSet isActivated name email DOB phone patientId",
        );
    }

    if (!users.length) {
      return res.json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    let resolvedUsers = [...users];

    if (resolvedUsers.length > 1 && !loginHint) {
      return res.json({
        success: false,
        code: "ACCOUNT_SELECTION_REQUIRED",
        message:
          "Bu telefon raqam yoki email bilan bir nechta akkaunt topildi. Iltimos, ism-sharif yoki emailni ham kiriting.",
      });
    }

    if (resolvedUsers.length > 1 && loginHint) {
      const normalizedHintEmail = validator.isEmail(loginHint)
        ? userModel.normalizeOptionalEmail(loginHint)
        : "";

      resolvedUsers = resolvedUsers.filter((user) => {
        const sameEmail =
          normalizedHintEmail &&
          userModel.normalizeOptionalEmail(user.email) === normalizedHintEmail;

        const sameName = userModel.isPatientNameEquivalent(user.name, loginHint);

        return sameEmail || sameName;
      });

      if (!resolvedUsers.length) {
        return res.json({
          success: false,
          code: "LOGIN_HINT_NOT_MATCHED",
          message:
            "Kiritilgan ism-sharif yoki email bo‘yicha akkaunt topilmadi. Iltimos, ism-sharif yoki emailni tekshirib qayta urinib ko‘ring.",
        });
      }
    }

    if (resolvedUsers.length > 1 && !loginDob) {
      return res.json({
        success: false,
        code: "ACCOUNT_DOB_REQUIRED",
        message:
          "Bir nechta mos akkaunt topildi. Iltimos, tug‘ilgan sanani ham kiriting.",
      });
    }

    if (resolvedUsers.length > 1 && loginDob) {
      resolvedUsers = resolvedUsers.filter(
        (user) => userModel.normalizeDateOnly(user.DOB) === loginDob,
      );

      if (!resolvedUsers.length) {
        return res.json({
          success: false,
          code: "LOGIN_DOB_NOT_MATCHED",
          message:
            "Kiritilgan tug‘ilgan sana bo‘yicha akkaunt topilmadi. Iltimos, sanani tekshirib qayta urinib ko‘ring.",
        });
      }
    }

    if (resolvedUsers.length > 1) {
      return res.json({
        success: false,
        message:
          "Bir nechta mos akkaunt topildi. Iltimos, administrator bilan bog‘laning.",
      });
    }

    const matchedUser = resolvedUsers[0];

    if (matchedUser.needsPasswordSet) {
      return res.json({
        success: false,
        code: "NEEDS_ACTIVATION",
        message:
          "Akkaunt hali faollashtirilmagan. Ism, telefon raqam va tug‘ilgan sana orqali faollashtiring.",
      });
    }

    const ok = await bcrypt.compare(String(password), matchedUser.password || "");
    if (!ok) {
      return res.json({ success: false, message: "Parol noto‘g‘ri" });
    }

    const token = jwt.sign({ userId: matchedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    return res.json({
      success: true,
      userData: {
        _id: user._id,
        patientId: user.patientId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        gender: user.gender,
        DOB: user.DOB,
        address: user.address,
        isActivated: user.isActivated,
        needsPasswordSet: user.needsPasswordSet,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    let { name, email, phone, address, DOB, gender } = req.body;

    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        address = {};
      }
    }

    const normalizedPhone = normalizePhone(phone || user.phone);
    if (!normalizedPhone) {
      return res.json({ success: false, message: "Telefon noto‘g‘ri" });
    }

        const emailNormalized = userModel.normalizeOptionalEmail(email);

    if (emailNormalized && !validator.isEmail(emailNormalized)) {
      return res.json({ success: false, message: "Email noto‘g‘ri" });
    }

    const capacity = await userModel.checkSharedContactCapacity({
      phone: normalizedPhone,
      email: emailNormalized,
      excludeUserId: user._id,
    });

    if (!capacity.ok) {
      return res.json({ success: false, message: capacity.message });
    }

    if (name && String(name).trim()) user.name = String(name).trim();
    user.phone = normalizedPhone;
    user.email = emailNormalized || undefined;

    if (["Erkak", "Ayol", "Tanlanmagan"].includes(gender)) {
      user.gender = gender;
    }

    if (DOB) {
      user.DOB = String(DOB);
    }

    if (address && typeof address === "object") {
      user.address = address;
    }

const oldImage = user.image;
const preparedPatientImage = req.file?.buffer
  ? await prepareImageForJpegStorage(req.file.buffer, {
      originalName: req.file.originalname,
    })
  : null;

if (preparedPatientImage) {
  const fileName = buildPatientImageFileName({
    patientId: user.patientId || String(user._id),
    patientName: user.name,
    ext: ".jpg",
  });

  const targetDir = path.join(process.cwd(), "uploads", "public", "patients");
  ensureDir(targetDir);

  const absPath = path.join(targetDir, fileName);
  await writePreparedImageToFile(preparedPatientImage, absPath);

  user.image = `/uploads/patients/${fileName}`;
}

await user.save();

if (
  preparedPatientImage &&
  oldImage &&
  oldImage !== user.image &&
  String(oldImage).startsWith("/uploads/patients/")
) {
  deletePublicFileByUrl(oldImage);
}

    return res.json({
      success: true,
      user: {
        _id: user._id,
        patientId: user.patientId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        gender: user.gender,
        DOB: user.DOB,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .populate("dentistID", "name image")
      .sort({ date: -1 });

    const list = appointments.map((a) => {
      const obj = a.toObject();

      return {
        _id: obj._id,
        slotDate: obj.slotDate,
        slotTime: obj.slotTime,
        durationMinutes: obj.durationMinutes,
        cancelled: obj.cancelled,
        status: obj.status,
        createdFrom: obj.createdFrom,
        dentistData: obj.dentistID
          ? {
              _id: obj.dentistID._id,
              name: obj.dentistID.name,
              image: obj.dentistID.image,
            }
          : null,
      };
    });

    res.json({ success: true, appointments: list });
  } catch (error) {
    console.error("getMyAppointments error:", error);
    res.json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { dentistID, slotDate, slotTime } = req.body;

    if (!dentistID || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Maʼlumotlar yetarli emas" });
    }

    const dentistData = await dentistModel.findById(dentistID);
    if (!dentistData || dentistData.isArchived) {
      return res.json({
        success: false,
        message: "Stomatolog hozir qabul uchun mavjud emas",
      });
    }

    const userData = await userModel.findById(userId).select("-password");

    let newAppointment;
    try {
      newAppointment = await createAppointmentSafe({
        userId,
        dentistID,
        slotDate,
        slotTime,
        userData,
        dentistData: {
          _id: dentistData._id,
          name: dentistData.name,
          image: dentistData.image,
        },
        createdFrom: "USER",
      });
    } catch (e) {
      return res.json({ success: false, message: e.message });
    }

    // Notify dentist via Telegram about the new online booking
    try {
      const { notifyDentistAboutNewBooking } = await import("../utils/telegramBot.js");
      await notifyDentistAboutNewBooking({
        dentistId: dentistID,
        patientName: userData.name,
        slotDate,
        slotTime,
        note: "",
        createdFrom: "USER",
      });
    } catch (tgErr) {
      console.warn("[bookAppointment] Dentist Telegram notify failed:", tgErr.message);
    }

    res.json({
      success: true,
      message: "Uchrashuv muvaffaqiyatli band qilindi",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.json({ success: false, message: "Uchrashuv topilmadi" });
    }

    if (appointment.status === "IN_PROGRESS" || appointment.status === "DONE") {
      return res.json({
        success: false,
        message:
          "Stomatolog tekshiruvni boshlagan. Uchrashuvni bekor qilib bo‘lmaydi.",
      });
    }

    if (appointment.cancelled) {
      return res.json({
        success: false,
        message: "Uchrashuv allaqachon bekor qilingan",
      });
    }

    appointment.cancelled = true;

    await appointment.save();

    await releaseLocksByAppointment(appointment._id);

    const dentist = await dentistModel.findById(appointment.dentistID);
    if (dentist?.slots_booked?.[appointment.slotDate]) {
      dentist.slots_booked[appointment.slotDate] = dentist.slots_booked[
        appointment.slotDate
      ].filter((t) => t !== appointment.slotTime);

      if (!dentist.slots_booked[appointment.slotDate].length) {
        delete dentist.slots_booked[appointment.slotDate];
      }

      await dentist.save();
    }

    return res.json({
      success: true,
      message: "Uchrashuv muvaffaqiyatli bekor qilshtirildi",
    });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};

const getMyTreatments = async (req, res) => {
  try {
    const userId = req.userId;

    const treatments = await treatmentModel
      .find({ userId })
      .populate("dentistId", "name image speciality")
      .populate("appointmentId", "slotDate slotTime")
      .sort({ createdAt: -1 });

    const list = treatments.map((t) => {
      const obj = t.toObject();
      const debt = Math.max(0, (obj.amount || 0) - (obj.paidAmount || 0));
      return { ...obj, debt };
    });

    res.json({ success: true, treatments: list });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { dentistID, fromDate, days } = req.query;

    if (!dentistID) {
      return res.json({
        success: false,
        message: "Stomatolog ID kerak",
      });
    }

    const numDays = Math.min(Math.max(Number(days) || 7, 1), 14);

    const dentist = await dentistModel
      .findById(dentistID)
      .select("_id isArchived speciality")
      .lean();

    if (!dentist || dentist.isArchived) {
      return res.json({
        success: false,
        message: "Stomatolog hozir qabul uchun mavjud emas",
      });
    }

    const availability = await getAvailabilityForDentist({
      dentistID,
      startDate: fromDate,
      days: numDays,
    });

    res.json({ success: true, availability });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMyTreatments,
  getAvailability,
};
