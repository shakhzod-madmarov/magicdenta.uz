import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = bearer || req.headers.token || null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token topilmadi (Vakolatli emas)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(403).json({ success: false, message: "Noto‘g‘ri token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("authUser error:", error);
    return res.status(401).json({ success: false, message: "Token yaroqsiz yoki muddati tugagan" });
  }
};

export default authUser;
