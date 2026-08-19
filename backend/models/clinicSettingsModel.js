import mongoose from "mongoose";

const dayScheduleSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true }, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    isOpen: { type: Boolean, default: true },
    start: { type: String, default: "08:00" },
    end: { type: String, default: "20:00" },
  },
  { _id: false }
);

const clinicSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "default", unique: true },
  workingSchedule: {
    type: [dayScheduleSchema],
    default: [
      { day: 1, isOpen: true, start: "08:00", end: "20:00" }, // Monday
      { day: 2, isOpen: true, start: "08:00", end: "20:00" },
      { day: 3, isOpen: true, start: "08:00", end: "20:00" },
      { day: 4, isOpen: true, start: "08:00", end: "20:00" },
      { day: 5, isOpen: true, start: "08:00", end: "20:00" },
      { day: 6, isOpen: true, start: "08:00", end: "20:00" }, // Saturday
      { day: 0, isOpen: false, start: "08:00", end: "20:00" }, // Sunday
    ],
  },
});

const clinicSettingsModel =
  mongoose.models.clinicSettings ||
  mongoose.model("clinicSettings", clinicSettingsSchema);

export default clinicSettingsModel;
