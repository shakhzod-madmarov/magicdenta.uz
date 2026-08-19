import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiverRole: {
      type: String,
      enum: ["DENTIST", "ADMIN"],
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["PAYMENT_CONFIRMED"],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;
