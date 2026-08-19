import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, 
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const MODEL_NAME = "Counter";

const Counter =
  mongoose.models[MODEL_NAME] || mongoose.model(MODEL_NAME, counterSchema);

export default Counter;
