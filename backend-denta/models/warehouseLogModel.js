import mongoose from "mongoose";

const warehouseLogSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouseItem",
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
    dentistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      index: true,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "expense",
      index: true,
    },
    operatorName: {
      type: String,
      default: "Admin",
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

const warehouseLogModel =
  mongoose.models.warehouseLog || mongoose.model("warehouseLog", warehouseLogSchema);

export default warehouseLogModel;
