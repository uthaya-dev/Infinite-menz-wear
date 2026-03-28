import mongoose from "mongoose";

const masterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["category", "size", "color", "brand", "supplier"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Master || mongoose.model("Master", masterSchema);
