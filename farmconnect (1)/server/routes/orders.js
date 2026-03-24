import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import protect from "../middleware/auth.js";

const router = Router();

// POST /api/orders — buyer places order
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can place orders" });
    }
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalPrice = quantity * product.pricePerUnit;
    const order = await Order.create({
      product: product._id,
      cropName: product.cropName,
      buyer: req.user._id,
      buyerName: req.user.name,
      farmer: product.farmer,
      farmerName: product.farmerName,
      quantity,
      unit: product.unit,
      totalPrice,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/my — orders for current user (buyer or farmer)
router.get("/my", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : { farmer: req.user._id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status — farmer accepts/rejects
router.put("/:id/status", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/stats — dashboard stats for current user
router.get("/stats", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : { farmer: req.user._id };
    const orders = await Order.find(filter);
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const accepted = orders.filter((o) => o.status === "accepted").length;
    const rejected = orders.filter((o) => o.status === "rejected").length;
    const revenue = orders
      .filter((o) => o.status === "accepted")
      .reduce((sum, o) => sum + o.totalPrice, 0);
    res.json({ total, pending, accepted, rejected, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
