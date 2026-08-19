import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATE_PATIENT",
        "EDIT_PATIENT",
        "BOOK_APPOINTMENT",
        "EDIT_APPOINTMENT",
        "CANCEL_APPOINTMENT",
        "CHECKOUT_APPOINTMENT",
        "COLLECT_PAYMENT",
        "CREATE_DENTIST",
        "EDIT_DENTIST",
        "RETIRE_DENTIST",
        "REACTIVATE_DENTIST",
        "CREATE_WAREHOUSE_ITEM",
        "WAREHOUSE_STOCK_IN",
        "WAREHOUSE_STOCK_OUT",
      ],
      required: true,
      index: true,
    },
    operatorId: { type: String, required: true, index: true },
    operatorRole: { type: String, required: true, index: true },
    operatorName: { type: String, required: true },
    targetId: { type: String, default: "", index: true },
    targetName: { type: String, default: "" },
    details: { type: String, default: "" },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

export default mongoose.models.activityLog ||
  mongoose.model("activityLog", activityLogSchema);
