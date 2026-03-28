import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    price: Number,
    total: Number,
  },
  { timestamps: true },
);

export default mongoose.models.SaleItem ||
  mongoose.model("SaleItem", saleItemSchema);
