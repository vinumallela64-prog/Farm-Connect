import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Rating from "./models/Rating.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const MARKET_PRICES = {
  Tomatoes: 25, Onions: 28, "Basmati Rice": 75, Wheat: 32, Potatoes: 20,
  "Alphonso Mangoes": 220, Cotton: 78, Sugarcane: 5, "Red Chillies": 140, Bananas: 32,
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Rating.deleteMany({});

  // Create demo users
  const farmers = await User.create([
    { name: "Ravi Kumar", email: "ravi@farm.com", phone: "+919876543210", password: "password123", location: "Nashik, MH", role: "farmer", verified: true },
    { name: "Suresh Patil", email: "suresh@farm.com", phone: "+919765432109", password: "password123", location: "Pune, MH", role: "farmer", verified: true },
    { name: "Rajendra Singh", email: "rajendra@farm.com", phone: "+918765432109", password: "password123", location: "Lucknow, UP", role: "farmer", verified: true },
    { name: "Harbhajan Kaur", email: "harbhajan@farm.com", phone: "+919654321098", password: "password123", location: "Amritsar, PB", role: "farmer", verified: true },
    { name: "Mukesh Sharma", email: "mukesh@farm.com", phone: "+917654321087", password: "password123", location: "Agra, UP", role: "farmer", verified: false },
    { name: "Anant Desai", email: "anant@farm.com", phone: "+916543210976", password: "password123", location: "Ratnagiri, MH", role: "farmer", verified: true },
    { name: "Venkat Rao", email: "venkat@farm.com", phone: "+915432109865", password: "password123", location: "Guntur, AP", role: "farmer", verified: true },
    { name: "Ramesh Yadav", email: "ramesh@farm.com", phone: "+914321098754", password: "password123", location: "Kolhapur, MH", role: "farmer", verified: false },
    { name: "Krishna Reddy", email: "krishna@farm.com", phone: "+913210987643", password: "password123", location: "Warangal, TS", role: "farmer", verified: true },
    { name: "Selvam Pillai", email: "selvam@farm.com", phone: "+912109876532", password: "password123", location: "Thanjavur, TN", role: "farmer", verified: true },
  ]);

  const buyers = await User.create([
    { name: "Priya Mehta", email: "priya@buy.com", phone: "+919765432109", password: "password123", location: "Mumbai, MH", role: "buyer" },
    { name: "Amit Joshi", email: "amit@buy.com", phone: "+919988776655", password: "password123", location: "Delhi", role: "buyer" },
    { name: "Sonal Gupta", email: "sonal@buy.com", phone: "+919877665544", password: "password123", location: "Bangalore, KA", role: "buyer" },
  ]);

  const listings = [
    { cropName: "Tomatoes", quantity: 500, unit: "kg", pricePerUnit: 18, description: "Fresh red tomatoes, farm-picked daily. Chemical-free.", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop", demandLevel: "High", distance: 12, delivery: "1-2 days", farmer: farmers[0] },
    { cropName: "Onions", quantity: 1000, unit: "kg", pricePerUnit: 22, description: "Premium quality onions, long shelf life.", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop", demandLevel: "High", distance: 28, delivery: "1-2 days", farmer: farmers[1] },
    { cropName: "Basmati Rice", quantity: 2000, unit: "kg", pricePerUnit: 65, description: "Aromatic long-grain Basmati. Grade A quality.", imageUrl: "https://images.unsplash.com/photo-1568347355280-d33fdf77d42a?w=400&h=300&fit=crop", demandLevel: "Medium", distance: 95, delivery: "2-3 days", farmer: farmers[2] },
    { cropName: "Wheat", quantity: 5000, unit: "kg", pricePerUnit: 28, description: "Golden wheat, fresh harvest. High protein content.", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop", demandLevel: "Low", distance: 210, delivery: "3-4 days", farmer: farmers[3] },
    { cropName: "Potatoes", quantity: 800, unit: "kg", pricePerUnit: 15, description: "Fresh potatoes, uniform size. Good for all cooking.", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop", demandLevel: "High", distance: 45, delivery: "1-2 days", farmer: farmers[4] },
    { cropName: "Alphonso Mangoes", quantity: 200, unit: "kg", pricePerUnit: 180, description: "GI-tagged Alphonso. Naturally ripened, no carbide.", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop", demandLevel: "High", distance: 67, delivery: "1-2 days", farmer: farmers[5] },
    { cropName: "Cotton", quantity: 3000, unit: "kg", pricePerUnit: 70, description: "Long staple cotton, high quality grade.", imageUrl: "https://images.unsplash.com/photo-1601055283742-8b27e81b5553?w=400&h=300&fit=crop", demandLevel: "Medium", distance: 320, delivery: "3-5 days", farmer: farmers[6] },
    { cropName: "Sugarcane", quantity: 10000, unit: "kg", pricePerUnit: 4, description: "Sweet sugarcane, direct from farm.", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop", demandLevel: "Low", distance: 88, delivery: "2-3 days", farmer: farmers[7] },
    { cropName: "Red Chillies", quantity: 300, unit: "kg", pricePerUnit: 120, description: "Spicy dried red chillies. Grade A, sun-dried.", imageUrl: "https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=300&fit=crop", demandLevel: "High", distance: 155, delivery: "2-3 days", farmer: farmers[8] },
    { cropName: "Bananas", quantity: 400, unit: "dozen", pricePerUnit: 25, description: "Sweet Nendran bananas. Freshly harvested.", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", demandLevel: "Medium", distance: 240, delivery: "2-3 days", farmer: farmers[9] },
  ];

  const products = await Product.create(
    listings.map((l) => ({
      ...l,
      marketPrice: MARKET_PRICES[l.cropName] || 0,
      farmer: l.farmer._id,
      farmerName: l.farmer.name,
      farmerPhone: l.farmer.phone,
      location: l.farmer.location,
      verified: l.farmer.verified,
    }))
  );

  // Seed some ratings
  await Rating.create([
    { farmer: farmers[0]._id, buyer: buyers[0]._id, score: 5, review: "Great quality produce!" },
    { farmer: farmers[0]._id, buyer: buyers[1]._id, score: 4, review: "Fast delivery, fresh items." },
    { farmer: farmers[0]._id, buyer: buyers[2]._id, score: 5, review: "Good price, would buy again." },
    { farmer: farmers[1]._id, buyer: buyers[0]._id, score: 4, review: "Nice onions, good quality." },
    { farmer: farmers[5]._id, buyer: buyers[1]._id, score: 5, review: "Best Alphonso mangoes!" },
    { farmer: farmers[2]._id, buyer: buyers[2]._id, score: 5, review: "Premium rice, excellent." },
  ]);

  // Seed some orders
  await Order.create([
    { product: products[0]._id, cropName: "Tomatoes", buyer: buyers[0]._id, buyerName: "Priya Mehta", farmer: farmers[0]._id, farmerName: "Ravi Kumar", quantity: 50, unit: "kg", totalPrice: 900, status: "pending" },
    { product: products[5]._id, cropName: "Alphonso Mangoes", buyer: buyers[1]._id, buyerName: "Amit Joshi", farmer: farmers[5]._id, farmerName: "Anant Desai", quantity: 10, unit: "kg", totalPrice: 1800, status: "accepted" },
    { product: products[8]._id, cropName: "Red Chillies", buyer: buyers[2]._id, buyerName: "Sonal Gupta", farmer: farmers[8]._id, farmerName: "Krishna Reddy", quantity: 20, unit: "kg", totalPrice: 2400, status: "rejected" },
  ]);

  console.log("Seed data created successfully!");
  console.log("\nDemo accounts:");
  console.log("  Farmer: ravi@farm.com / password123");
  console.log("  Buyer:  priya@buy.com / password123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
