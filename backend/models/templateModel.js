import mongoose from "mongoose";

const { Schema } = mongoose;

const templateSchema = new Schema(
  {
    dentistId: {
      type: Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    diagnosis: { type: String, default: "" },
    teeth: { type: String, default: "" },
    procedures: { type: String, default: "" },
    nextStep: { type: String, default: "" },
    medicines: { type: String, default: "" },
    notes: { type: String, default: "" },
    isFavorite: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    useCount: { type: Number, default: 0, min: 0 },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

templateSchema.index({ dentistId: 1, title: 1 });

const templateModel =
  mongoose.models.template || mongoose.model("template", templateSchema);

export default templateModel;
