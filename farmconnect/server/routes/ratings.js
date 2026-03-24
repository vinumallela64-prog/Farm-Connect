import { Router } from "express";
import Rating from "../models/Rating.js";
import protect from "../middleware/auth.js";

const router = Router();

// POST /api/ratings
router.post("/", protect, async (req, res) => {
  try {
    const { farmerId, score, review } = req.body;
    if (!farmerId || !score) {
      return res.status(400).json({ message: "farmerId and score are required" });
    }
    const rating = await Rating.create({
      farmer: farmerId,
      buyer: req.user._id,
      score,
      review: review || "",
    });
    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ratings/farmer/:farmerId
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const ratings = await Rating.find({ farmer: req.params.farmerId })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    const avgScore =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;
    res.json({ ratings, avgScore: Math.round(avgScore * 10) / 10, count: ratings.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
