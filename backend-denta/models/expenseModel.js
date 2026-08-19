import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Materiallar", "Ijara", "Oylik", "Kommunal", "Boshqa"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

const expenseModel = mongoose.models.expense || mongoose.model("expense", expenseSchema);
export default expenseModel;
