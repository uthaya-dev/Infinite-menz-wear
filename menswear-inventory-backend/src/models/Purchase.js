import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Master",
      required: true,
    },
    date: { type: Date, default: Date.now },
    totalAmount: Number,
    items: [
      {
        variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        qty: { type: Number, required: true },
        purchasePrice: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Purchase ||
  mongoose.model("Purchase", purchaseSchema);
