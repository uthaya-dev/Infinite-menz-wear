import mongoose from "mongoose";

const masterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["category", "size", "color", "brand", "supplier"],
      required: true,
    },

    // For normal types
    name: {
      type: String,
      trim: true,
    },

    // For color type
    primaryColor: {
      type: String,
      trim: true,
    },
    secondaryColor: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// ✅ Conditional validation
masterSchema.pre("validate", function (next) {
  if (this.type === "color") {
    if (!this.primaryColor) {
      return next(new Error("Primary color is required"));
    }
  } else {
    if (!this.name) {
      return next(new Error("Name is required"));
    }
  }
  next();
});

export default mongoose.models.Master || mongoose.model("Master", masterSchema);
