import mongoose from "mongoose";

const commissionPayoutSchema = new mongoose.Schema(
  {
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payoutDate: {
      type: Date,
      default: Date.now,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    paidBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

const commissionPayoutModel = mongoose.models.commissionPayout || mongoose.model("commissionPayout", commissionPayoutSchema);
export default commissionPayoutModel;
