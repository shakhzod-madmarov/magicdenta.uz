import mongoose from "mongoose";

// Transaction log for dentist's OWN personal warehouse
const dentistWarehouseLogSchema = new mongoose.Schema(
  {
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentistWarehouseItem",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
      index: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 0.001,
    },
    pricePerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const dentistWarehouseLogModel =
  mongoose.models.dentistWarehouseLog ||
  mongoose.model("dentistWarehouseLog", dentistWarehouseLogSchema);

export default dentistWarehouseLogModel;
