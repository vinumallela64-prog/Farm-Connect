import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    cropName: { type: String, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    farmerName: { type: String, default: "" },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
