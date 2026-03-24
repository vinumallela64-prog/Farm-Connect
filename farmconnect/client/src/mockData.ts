export interface MockListing {
  id: string;
  cropName: string;
  farmerName: string;
  farmerId: string;
  farmerPhone: string;
  location: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  marketPrice: number;
  demandLevel: "High" | "Medium" | "Low";
  imageUrl: string;
  description: string;
  distance?: number;
  delivery?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface MockFarmer {
  id: string;
  name: string;
  phone: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  cropCount: number;
}

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "1",
    cropName: "Tomatoes",
    farmerName: "Ravi Kumar",
    farmerId: "f1",
    farmerPhone: "+919876543210",
    location: "Nashik, MH",
    quantity: 500,
    unit: "kg",
    pricePerUnit: 18,
    marketPrice: 25,
    demandLevel: "High",
    imageUrl:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
    description: "Fresh red tomatoes, farm-picked daily. Chemical-free.",
    distance: 12,
    delivery: "1-2 days",
    rating: 4.7,
    reviewCount: 23,
    verified: true,
  },
  {
    id: "2",
    cropName: "Onions",
    farmerName: "Suresh Patil",
    farmerId: "f2",
    farmerPhone: "+919765432109",
    location: "Pune, MH",
    quantity: 1000,
    unit: "kg",
    pricePerUnit: 22,
    marketPrice: 28,
    demandLevel: "High",
    imageUrl:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
    description: "Premium quality onions, long shelf life.",
    distance: 28,
    delivery: "1-2 days",
    rating: 4.5,
    reviewCount: 31,
    verified: true,
  },
  {
    id: "3",
    cropName: "Basmati Rice",
    farmerName: "Rajendra Singh",
    farmerId: "f3",
    farmerPhone: "+918765432109",
    location: "Lucknow, UP",
    quantity: 2000,
    unit: "kg",
    pricePerUnit: 65,
    marketPrice: 75,
    demandLevel: "Medium",
    imageUrl:
      "https://images.unsplash.com/photo-1568347355280-d33fdf77d42a?w=400&h=300&fit=crop",
    description: "Aromatic long-grain Basmati. Grade A quality.",
    distance: 95,
    delivery: "2-3 days",
    rating: 4.8,
    reviewCount: 47,
    verified: true,
  },
  {
    id: "4",
    cropName: "Wheat",
    farmerName: "Harbhajan Kaur",
    farmerId: "f4",
    farmerPhone: "+919654321098",
    location: "Amritsar, PB",
    quantity: 5000,
    unit: "kg",
    pricePerUnit: 28,
    marketPrice: 32,
    demandLevel: "Low",
    imageUrl:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
    description: "Golden wheat, fresh harvest. High protein content.",
    distance: 210,
    delivery: "3-4 days",
    rating: 4.3,
    reviewCount: 19,
    verified: true,
  },
  {
    id: "5",
    cropName: "Potatoes",
    farmerName: "Mukesh Sharma",
    farmerId: "f5",
    farmerPhone: "+917654321087",
    location: "Agra, UP",
    quantity: 800,
    unit: "kg",
    pricePerUnit: 15,
    marketPrice: 20,
    demandLevel: "High",
    imageUrl:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
    description: "Fresh potatoes, uniform size. Good for all cooking.",
    distance: 45,
    delivery: "1-2 days",
    rating: 4.4,
    reviewCount: 28,
    verified: false,
  },
  {
    id: "6",
    cropName: "Alphonso Mangoes",
    farmerName: "Anant Desai",
    farmerId: "f6",
    farmerPhone: "+916543210976",
    location: "Ratnagiri, MH",
    quantity: 200,
    unit: "kg",
    pricePerUnit: 180,
    marketPrice: 220,
    demandLevel: "High",
    imageUrl:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop",
    description: "GI-tagged Alphonso. Naturally ripened, no carbide.",
    distance: 67,
    delivery: "1-2 days",
    rating: 4.9,
    reviewCount: 62,
    verified: true,
  },
  {
    id: "7",
    cropName: "Cotton",
    farmerName: "Venkat Rao",
    farmerId: "f7",
    farmerPhone: "+915432109865",
    location: "Guntur, AP",
    quantity: 3000,
    unit: "kg",
    pricePerUnit: 70,
    marketPrice: 78,
    demandLevel: "Medium",
    imageUrl:
      "https://images.unsplash.com/photo-1601055283742-8b27e81b5553?w=400&h=300&fit=crop",
    description: "Long staple cotton, high quality grade.",
    distance: 320,
    delivery: "3-5 days",
    rating: 4.2,
    reviewCount: 14,
    verified: true,
  },
  {
    id: "8",
    cropName: "Sugarcane",
    farmerName: "Ramesh Yadav",
    farmerId: "f8",
    farmerPhone: "+914321098754",
    location: "Kolhapur, MH",
    quantity: 10000,
    unit: "kg",
    pricePerUnit: 4,
    marketPrice: 5,
    demandLevel: "Low",
    imageUrl:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop",
    description: "Sweet sugarcane, direct from farm.",
    distance: 88,
    delivery: "2-3 days",
    rating: 4.0,
    reviewCount: 9,
    verified: false,
  },
  {
    id: "9",
    cropName: "Red Chillies",
    farmerName: "Krishna Reddy",
    farmerId: "f9",
    farmerPhone: "+913210987643",
    location: "Warangal, TS",
    quantity: 300,
    unit: "kg",
    pricePerUnit: 120,
    marketPrice: 140,
    demandLevel: "High",
    imageUrl:
      "https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=300&fit=crop",
    description: "Spicy dried red chillies. Grade A, sun-dried.",
    distance: 155,
    delivery: "2-3 days",
    rating: 4.6,
    reviewCount: 37,
    verified: true,
  },
  {
    id: "10",
    cropName: "Bananas",
    farmerName: "Selvam Pillai",
    farmerId: "f10",
    farmerPhone: "+912109876532",
    location: "Thanjavur, TN",
    quantity: 400,
    unit: "dozen",
    pricePerUnit: 25,
    marketPrice: 32,
    demandLevel: "Medium",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop",
    description: "Sweet Nendran bananas. Freshly harvested.",
    distance: 240,
    delivery: "2-3 days",
    rating: 4.5,
    reviewCount: 21,
    verified: true,
  },
];

export const MARKET_PRICES: Record<string, number> = {
  tomatoes: 25,
  onions: 28,
  "basmati rice": 75,
  wheat: 32,
  potatoes: 20,
  "alphonso mangoes": 220,
  cotton: 78,
  sugarcane: 5,
  "red chillies": 140,
  bananas: 32,
  rice: 55,
  maize: 18,
  soybean: 45,
  groundnut: 65,
  mustard: 52,
};

export const PRICE_TREND_DATA: Record<string, number[]> = {
  Tomatoes: [22, 24, 21, 25, 23, 26, 25],
  Onions: [30, 27, 28, 29, 26, 28, 28],
  "Basmati Rice": [70, 72, 73, 74, 74, 75, 75],
  Wheat: [30, 31, 31, 32, 32, 32, 32],
  Potatoes: [18, 19, 20, 19, 21, 20, 20],
  "Alphonso Mangoes": [200, 210, 215, 218, 220, 220, 220],
  Cotton: [74, 75, 76, 77, 77, 78, 78],
  Sugarcane: [5, 5, 5, 5, 5, 5, 5],
  "Red Chillies": [130, 133, 136, 138, 139, 140, 140],
  Bananas: [28, 29, 30, 31, 31, 32, 32],
};

export const CROP_SUGGESTIONS = [
  "Tomatoes",
  "Onions",
  "Potatoes",
  "Basmati Rice",
  "Wheat",
  "Maize",
  "Alphonso Mangoes",
  "Cotton",
  "Sugarcane",
  "Red Chillies",
  "Bananas",
  "Groundnuts",
  "Soybeans",
  "Mustard",
  "Ginger",
  "Garlic",
  "Turmeric",
  "Cabbage",
  "Cauliflower",
  "Brinjal",
  "Spinach",
  "Coriander",
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    message: "📦 New order for 50kg Tomatoes",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    message: "✅ Order #ORD-1042 accepted",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    message: "⭐ Ravi Kumar rated 4.5 stars",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "4",
    message: "🌾 New listing: Red Chillies from Warangal",
    time: "3 hr ago",
    read: true,
  },
];

export const MOCK_ORDERS = [
  {
    id: "ORD-1041",
    listingId: "1",
    cropName: "Tomatoes",
    buyerName: "Priya Mehta",
    quantity: 50,
    unit: "kg",
    totalPrice: 900,
    status: "pending" as const,
    date: "2024-03-20",
  },
  {
    id: "ORD-1042",
    listingId: "6",
    cropName: "Alphonso Mangoes",
    buyerName: "Amit Joshi",
    quantity: 10,
    unit: "kg",
    totalPrice: 1800,
    status: "accepted" as const,
    date: "2024-03-19",
  },
  {
    id: "ORD-1043",
    listingId: "9",
    cropName: "Red Chillies",
    buyerName: "Sonal Gupta",
    quantity: 20,
    unit: "kg",
    totalPrice: 2400,
    status: "rejected" as const,
    date: "2024-03-18",
  },
];
