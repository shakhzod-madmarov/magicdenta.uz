import jwt from "jsonwebtoken";
import dentistModel from "../models/dentistModel.js";

const authAdminOrDentist = async (req, res, next) => {
  let token = null;
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    token = bearerToken || req.headers.atoken || req.headers.dtoken || null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token topilmadi (Vakolatli emas)",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.role === "admin") {
      req.adminId = decoded.id;
      req.isAdmin = true;
      return next();
    }

    if (decoded?.dentistId) {
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
      req.isDentist = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Vakolatli emas (admin yoki stomatolog emas)",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token yaroqsiz yoki muddati tugagan",
    });
  }
};

export default authAdminOrDentist;
