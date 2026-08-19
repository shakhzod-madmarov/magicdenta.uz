import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";
import { normalizePhone } from "../utils/phone.js";

const buildUserToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const claimAccountByIdAndDob = async (req, res) => {
  try {
    const { patientId, name, phone, DOB, password } = req.body || {};

    if (!DOB || !password) {
      return res.json({
        success: false,
        message: "Tug‘ilgan sana va parol majburiy",
      });
    }

    if (String(password).length < 6) {
      return res.json({
        success: false,
        message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak",
      });
    }

    if (patientId) {
      const user = await userModel.findOne({
        patientId: String(patientId).trim().toUpperCase(),
      });

      if (!user) {
        return res.json({ success: false, message: "Bemor topilmadi" });
      }

      if (!user.needsPasswordSet) {
        return res.json({
          success: false,
          message: "Akkaunt allaqachon faollashtirilgan",
        });
      }

      if (userModel.normalizeDateOnly(user.DOB) !== userModel.normalizeDateOnly(DOB)) {
        return res.json({
          success: false,
          message: "Tug‘ilgan sana noto‘g‘ri",
        });
      }

      if (name && String(name).trim()) {
        user.name = String(name).trim();
      }

      if (phone) {
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone) {
          return res.json({
            success: false,
            message: "Telefon raqam noto‘g‘ri formatda",
          });
        }

        const capacity = await userModel.checkSharedContactCapacity({
          phone: normalizedPhone,
          excludeUserId: user._id,
        });

        if (!capacity.ok) {
          return res.json({ success: false, message: capacity.message });
        }

        user.phone = normalizedPhone;
      }

      user.password = await bcrypt.hash(String(password), 10);
      user.needsPasswordSet = false;
      user.isActivated = true;
      await user.save();

      const token = buildUserToken(user._id);

      return res.json({
        success: true,
        message: "Akkaunt muvaffaqiyatli faollashtirildi",
        token,
      });
    }

    if (!name || !phone) {
      return res.json({
        success: false,
        message: "Ism, telefon raqam, tug‘ilgan sana va parol majburiy",
      });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.json({
        success: false,
        message: "Telefon raqam noto‘g‘ri formatda",
      });
    }

    const pendingUsers = await userModel
      .find({ phone: normalizedPhone, needsPasswordSet: true })
      .select("patientId name DOB phone email needsPasswordSet");

    if (!pendingUsers.length) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    const matchedUsers = pendingUsers.filter((user) =>
      userModel.isSamePatientIdentity(user, { name, DOB }),
    );

    if (!matchedUsers.length) {
      const hasSameDob = pendingUsers.some(
        (user) =>
          userModel.normalizeDateOnly(user.DOB) ===
          userModel.normalizeDateOnly(DOB),
      );

      return res.json({
        success: false,
        message: hasSameDob ? "Ism mos kelmadi" : "Tug‘ilgan sana noto‘g‘ri",
      });
    }

    if (matchedUsers.length > 1) {
      return res.json({
        success: false,
        message:
          "Bir nechta mos akkaunt topildi. Iltimos, administrator bilan bog‘laning.",
      });
    }

    const user = matchedUsers[0];

    const capacity = await userModel.checkSharedContactCapacity({
      phone: normalizedPhone,
      excludeUserId: user._id,
    });

    if (!capacity.ok) {
      return res.json({ success: false, message: capacity.message });
    }

    user.name = String(name).trim();
    user.phone = normalizedPhone;
    user.password = await bcrypt.hash(String(password), 10);
    user.needsPasswordSet = false;
    user.isActivated = true;
    await user.save();

    const token = buildUserToken(user._id);

    return res.json({
      success: true,
      message: "Akkaunt muvaffaqiyatli faollashtirildi",
      token,
    });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};

export const resetForgottenPassword = async (req, res) => {
  try {
    const { name, DOB, emailOrPhone, password } = req.body || {};

    if (!name || !DOB || !emailOrPhone || !password) {
      return res.json({
        success: false,
        message: "Ism, tug‘ilgan sana, telefon yoki email va yangi parol majburiy",
      });
    }

    if (String(password).length < 6) {
      return res.json({
        success: false,
        message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak",
      });
    }

    const credential = String(emailOrPhone).trim();
    const normalizedDob = userModel.normalizeDateOnly(DOB);
    let users = [];

    if (validator.isEmail(credential)) {
      const normalizedEmail = userModel.normalizeOptionalEmail(credential);

      if (!normalizedEmail) {
        return res.json({
          success: false,
          message: "Email noto‘g‘ri formatda",
        });
      }

      users = await userModel
        .find({ email: normalizedEmail })
        .select("+password patientId name DOB email phone needsPasswordSet isActivated");
    } else {
      const normalizedPhone = normalizePhone(credential);

      if (!normalizedPhone) {
        return res.json({
          success: false,
          message: "Telefon raqam noto‘g‘ri formatda",
        });
      }

      users = await userModel
        .find({ phone: normalizedPhone })
        .select("+password patientId name DOB email phone needsPasswordSet isActivated");
    }

    if (!users.length) {
      return res.json({ success: false, message: "Bemor topilmadi" });
    }

    const activeUsers = users.filter((user) => !user.needsPasswordSet);

    if (!activeUsers.length) {
      return res.json({
        success: false,
        code: "NEEDS_ACTIVATION",
        message:
          "Akkaunt hali faollashtirilmagan. Ism, telefon raqam va tug‘ilgan sana orqali faollashtiring.",
      });
    }

    const matchedUsers = activeUsers.filter((user) => {
      const sameIdentity = userModel.isSamePatientIdentity(user, {
        name,
        DOB: normalizedDob,
      });

      return sameIdentity;
    });

    if (!matchedUsers.length) {
      const hasSameDob = activeUsers.some(
        (user) => userModel.normalizeDateOnly(user.DOB) === normalizedDob,
      );

      return res.json({
        success: false,
        message: hasSameDob ? "Ism mos kelmadi" : "Tug‘ilgan sana noto‘g‘ri",
      });
    }

    if (matchedUsers.length > 1) {
      return res.json({
        success: false,
        message:
          "Bir nechta mos akkaunt topildi. Iltimos, administrator bilan bog‘laning.",
      });
    }

    const user = matchedUsers[0];

    user.password = await bcrypt.hash(String(password), 10);
    await user.save();

    return res.json({
      success: true,
      message: "Parol muvaffaqiyatli yangilandi. Endi login qiling.",
    });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};
