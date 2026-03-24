import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    pricePerUnit: { type: Number, required: true },
    marketPrice: { type: Number, default: 0 },
    location: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    demandLevel: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    distance: { type: Number, default: 0 },
    delivery: { type: String, default: "2-3 days" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: "" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
