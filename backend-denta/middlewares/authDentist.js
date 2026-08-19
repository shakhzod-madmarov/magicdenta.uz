import jwt from "jsonwebtoken";
import dentistModel from "../models/dentistModel.js";

const authDentist = async (req, res, next) => {
  let token = null;
  try {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    token = bearer || req.headers.dtoken || null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Dentist token topilmadi (Vakolatli emas)",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.dentistId) {
      return res
        .status(403)
        .json({ success: false, message: "Noto‘g‘ri token" });
    }

    const dentist = await dentistModel
      .findById(decoded.dentistId)
      .select("_id isArchived")
      .lean();

    if (!dentist || dentist.isArchived) {
      return res.status(403).json({
        success: false,
        message: "Bu stomatolog akkaunti faol emas",
      });
    }

    req.dentistId = decoded.dentistId;
    next();
  } catch (error) {
    console.error("authDentist error:", error, "Token received:", JSON.stringify(token));
    return res.status(401).json({
      success: false,
      message: "Token yaroqsiz yoki muddati tugagan",
    });
  }
};

export default authDentist;
