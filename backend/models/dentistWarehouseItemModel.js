import mongoose from "mongoose";

// Dentist's OWN personal warehouse items — separate from clinic's shared warehouse
const dentistWarehouseItemSchema = new mongoose.Schema(
  {
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },
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
      default: 2,
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

const dentistWarehouseItemModel =
  mongoose.models.dentistWarehouseItem ||
  mongoose.model("dentistWarehouseItem", dentistWarehouseItemSchema);

export default dentistWarehouseItemModel;
