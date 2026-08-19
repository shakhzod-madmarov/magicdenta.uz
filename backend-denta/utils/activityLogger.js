import activityLogModel from "../models/activityLogModel.js";
import dentistModel from "../models/dentistModel.js";

export const logActivity = async (action, req, targetId = "", targetName = "", details = "") => {
  try {
    const role = req.authRole || "admin";
    let operatorId = "";
    let operatorName = "Super Admin";

    if (role === "admin") {
      operatorId = req.adminId || "admin";
      operatorName = "Super Admin";
    } else if (role === "dentist") {
      operatorId = req.dentistId;
      const den = await dentistModel.findById(operatorId);
      if (den) operatorName = den.name;
    }

    const todayYMD = new Date().toISOString().split("T")[0];

    await activityLogModel.create({
      action,
      operatorId: String(operatorId || "system"),
      operatorRole: role,
      operatorName: operatorName || "Noma'lum xodim",
      targetId: String(targetId),
      targetName,
      details,
      date: todayYMD,
    });
  } catch (error) {
    console.error("logActivity error:", error);
  }
};
