import mongoose from "mongoose";

const dentistLiveStatusSchema = new mongoose.Schema(
  {
    dentistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      enum: ["AVAILABLE", "BUSY"],
      default: "AVAILABLE",
      index: true,
    },
    currentAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    note: { type: String, default: "" },
    lastBusyAt: { type: Number, default: null },
    lastFinishedAt: { type: Number, default: null },
  },
  { timestamps: true },
);

const MODEL_NAME = "dentistLiveStatus";
const dentistLiveStatusModel =
  mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, dentistLiveStatusSchema);

export default dentistLiveStatusModel;
