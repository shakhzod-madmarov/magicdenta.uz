import mongoose from "mongoose";

const appointmentSlotLockSchema = new mongoose.Schema(
  {
    dentistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
    },
    slotDate: { type: String, required: true }, 
    slotTime: { type: String, required: true }, 
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
    },
    bookingKey: { type: String, required: true }, 
  },
  {
    versionKey: false,
    timestamps: true, 
  },
);

appointmentSlotLockSchema.index(
  { dentistID: 1, slotDate: 1, slotTime: 1 },
  { unique: true },
);

const MODEL_NAME = "appointment_slot_lock";

const appointmentSlotLockModel =
  mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, appointmentSlotLockSchema);

export default appointmentSlotLockModel;
