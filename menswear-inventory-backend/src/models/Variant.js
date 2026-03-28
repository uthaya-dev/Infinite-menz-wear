import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
    },

    stockQty: {
      type: Number,
      default: 0,
    },

    purchasePrice: Number,
    sellingPrice: Number,
  },
  { timestamps: true },
);

export default mongoose.models.Variant ||
  mongoose.model("Variant", variantSchema);
