import mongoose from "mongoose";

const warehouseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["CONSUMABLES", "INSTRUMENTS", "MEDICINES", "OTHER"],
      required: true,
      default: "CONSUMABLES",
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: "dona",
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minQty: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastStockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const warehouseItemModel =
  mongoose.models.warehouseItem || mongoose.model("warehouseItem", warehouseItemSchema);

export default warehouseItemModel;
