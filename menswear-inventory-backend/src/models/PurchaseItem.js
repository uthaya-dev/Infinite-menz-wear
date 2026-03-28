import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
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
    purchasePrice: Number,
    total: Number,
  },
  { timestamps: true },
);

export default mongoose.models.PurchaseItem ||
  mongoose.model("PurchaseItem", purchaseItemSchema);
