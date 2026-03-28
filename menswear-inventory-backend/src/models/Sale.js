import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
      default: "cash",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
