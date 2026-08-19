import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "in_progress", "contacted", "archived"],
      default: "new",
      index: true,
    },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String, default: "" },
    telegramSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const contactModel =
  mongoose.models.contact || mongoose.model("contact", contactSchema);

export default contactModel;
