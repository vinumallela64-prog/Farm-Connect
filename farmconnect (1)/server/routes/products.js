import { Router } from "express";
import Product from "../models/Product.js";
import Rating from "../models/Rating.js";
import protect from "../middleware/auth.js";

const router = Router();

// GET /api/products — public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Attach average rating to each product
    const enriched = await Promise.all(
      products.map(async (p) => {
        const ratings = await Rating.find({ farmer: p.farmer });
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;
        return {
          ...p.toObject(),
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
        };
      })
    );
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const ratings = await Rating.find({ farmer: product.farmer });
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;
    res.json({
      ...product.toObject(),
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products — farmer only
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can add products" });
    }
    const { cropName, description, quantity, unit, pricePerUnit, marketPrice, location, imageUrl, demandLevel, distance, delivery } = req.body;
    const product = await Product.create({
      cropName,
      description,
      quantity,
      unit,
      pricePerUnit,
      marketPrice: marketPrice || 0,
      location: location || req.user.location,
      imageUrl,
      demandLevel,
      distance,
      delivery,
      farmer: req.user._id,
      farmerName: req.user.name,
      farmerPhone: req.user.phone,
      verified: req.user.verified,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/products/:id — farmer who owns it
router.put("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id — farmer who owns it
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/farmer/me — my listings
router.get("/farmer/me", protect, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
