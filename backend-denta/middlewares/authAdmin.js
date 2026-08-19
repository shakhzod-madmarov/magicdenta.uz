import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  let token = null;
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    token = bearerToken || req.headers.atoken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Vakolatli emas (admin token yo‘q)",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Vakolatli emas (admin emas)",
      });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.error("authAdmin error:", error, "Token received:", JSON.stringify(token));
    return res.status(401).json({
      success: false,
      message: "Token yaroqsiz yoki muddati tugagan",
    });
  }
};

export default authAdmin;
