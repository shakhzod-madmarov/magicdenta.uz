import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("MongoDB connected"));

    mongoose.connection.on("error", (err) =>
      console.error("MongoDB error:", err),
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "magicdenta_dev",
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name: "users" }).toArray();
      if (collections.length > 0) {
        const indexes = await db.collection("users").indexes();
        const hasUniqueIndex = indexes.some((idx) => idx.name === "unique_telegram_chat_id");
        if (hasUniqueIndex) {
          await db.collection("users").dropIndex("unique_telegram_chat_id");
          console.log("Successfully dropped legacy unique_telegram_chat_id index.");
        }
      }
    } catch (indexErr) {
      console.warn("Failed to check/drop unique_telegram_chat_id index:", indexErr.message);
    }

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
