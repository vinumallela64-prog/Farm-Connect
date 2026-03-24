import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import { useLang } from "../LanguageContext";
import { api } from "../api";
import DemandBadge from "../components/DemandBadge";
import ReceiptModal from "../components/ReceiptModal";
import { type MockListing, PRICE_TREND_DATA } from "../mockData";

type OrderStatus = "pending" | "accepted" | "rejected";
interface Order {
  id: string;
  listingId: string;
  cropName: string;
  buyerName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: OrderStatus;
  date: string;
  farmerName?: string;
}

interface BuyerDashboardProps {
  activeTab: string;
  onTabChange: (t: string) => void;
}

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (v: number) => void;
}) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          className={`${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ────────── skeleton card while loading ────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="w-full h-44 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState(500);
  const [filterLocation, setFilterLocation] = useState("");
  const [detailListing, setDetailListing] = useState<MockListing | null>(null);
  const [orderListing, setOrderListing] = useState<MockListing | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [farmerProfileListing, setFarmerProfileListing] =
    useState<MockListing | null>(null);
  const [allListings, setAllListings] = useState<MockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmerReviews, setFarmerReviews] = useState<
    { score: number; review: string; buyerName?: string }[]
  >([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    revenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [products, apiOrders] = await Promise.all([
          api.getProducts(),
          api.getMyOrders(),
        ]);
        setAllListings(
          (Array.isArray(products) ? products : []).map((p: any) => ({
            id: p._id,
            _id: p._id,
            cropName: p.cropName,
            farmerName: p.farmerName,
            farmerId: p.farmer,
            farmerPhone: p.farmerPhone || "",
            location: p.location,
            quantity: p.quantity,
            unit: p.unit,
            pricePerUnit: p.pricePerUnit,
            marketPrice: p.marketPrice || p.pricePerUnit * 1.2,
            demandLevel: p.demandLevel || "Medium",
            imageUrl:
              p.imageUrl ||
              "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
            description: p.description,
            distance: p.distance || 0,
            delivery: p.delivery || "2-3 days",
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            verified: p.verified || false,
          })),
        );
        const orderArr = Array.isArray(apiOrders) ? apiOrders : [];
        const mapped = orderArr.map((o: any) => ({
          id: o._id,
          _id: o._id,
          listingId: o.product,
          cropName: o.cropName,
          buyerName: o.buyerName,
          farmerName: o.farmerName,
          quantity: o.quantity,
          unit: o.unit,
          totalPrice: o.totalPrice,
          status: o.status,
          date: new Date(o.createdAt).toISOString().split("T")[0],
        }));
        setMyOrders(mapped);
        setOrderStats({
          total: mapped.length,
          pending: mapped.filter((o: Order) => o.status === "pending").length,
          accepted: mapped.filter((o: Order) => o.status === "accepted").length,
          revenue: mapped
            .filter((o: Order) => o.status === "accepted")
            .reduce((s: number, o: Order) => s + o.totalPrice, 0),
        });
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* fetch real reviews when farmer modal opens */
  useEffect(() => {
    if (!farmerProfileListing) return;
    api
      .getFarmerRatings(farmerProfileListing.farmerId)
      .then((data: any) => {
        if (data?.ratings) setFarmerReviews(data.ratings);
      })
      .catch(() => {});
  }, [farmerProfileListing]);

  const isFraud = (l: MockListing) =>
    l.pricePerUnit > l.marketPrice * 3 || l.pricePerUnit < l.marketPrice * 0.2;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allListings.filter((l) => {
      if (
        q &&
        !l.cropName.toLowerCase().includes(q) &&
        !l.farmerName.toLowerCase().includes(q) &&
        !l.location.toLowerCase().includes(q)
      )
        return false;
      if (filterCrop && l.cropName !== filterCrop) return false;
      if (l.pricePerUnit > filterMaxPrice) return false;
      if (
        filterLocation &&
        !l.location.toLowerCase().includes(filterLocation.toLowerCase())
      )
        return false;
      return true;
    });
  }, [search, filterCrop, filterMaxPrice, filterLocation, allListings]);

  const whatsappShare = (l: MockListing) => {
    const text = encodeURIComponent(
      `🌾 ${l.cropName} - ₹${l.pricePerUnit}/${l.unit}\n📦 ${l.quantity} ${l.unit} available\n📍 ${l.location}\n👨‍🌾 ${l.farmerName}\n\nOrder via FarmConnect!`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const placeOrder = async () => {
    if (!orderListing) return;
    try {
      const created = await api.placeOrder({
        productId: orderListing.id,
        quantity: orderQty,
      });
      const newOrder: Order = {
        id: created._id,
        listingId: orderListing.id,
        cropName: orderListing.cropName,
        buyerName: user?.name || "Buyer",
        farmerName: orderListing.farmerName,
        quantity: orderQty,
        unit: orderListing.unit,
        totalPrice: orderQty * orderListing.pricePerUnit,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
      };
      setMyOrders((prev) => [newOrder, ...prev]);
      setOrderStats((s) => ({
        ...s,
        total: s.total + 1,
        pending: s.pending + 1,
      }));
      setOrderListing(null);
      setDetailListing(null);
      toast.success(t("orderPlaced"));
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    }
  };

  const trendData = detailListing
    ? (PRICE_TREND_DATA[detailListing.cropName] || []).map((v, i) => ({
        day: `D${i + 1}`,
        price: v,
      }))
    : [];

  const cropTypes = Array.from(new Set(allListings.map((l) => l.cropName)));

  /* ───────────────── Product card ───────────────── */
  const renderCard = (l: MockListing, idx: number) => {
    const aiPrice = Math.round(l.marketPrice * 0.85);
    const savings = Math.round((1 - l.pricePerUnit / l.marketPrice) * 100);
    return (
      <div
        key={l.id}
        className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-border card-hover animate-fade-in"
        style={{ animationDelay: `${idx * 60}ms` }}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={l.imageUrl}
            alt={l.cropName}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {isFraud(l) && (
            <div className="absolute top-2.5 left-2.5 bg-red-500/90 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              {t("fraudWarning")}
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            <DemandBadge level={l.demandLevel} />
          </div>
          {l.verified && (
            <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-green-500">✓</span> Verified
            </div>
          )}
          {savings > 0 && (
            <div className="absolute bottom-2.5 right-2.5 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {savings}% off
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] truncate">{l.cropName}</h3>
              <p className="text-xs text-muted-foreground">
                📦 {l.quantity} {l.unit} available
              </p>
            </div>
          </div>

          {/* Prices */}
          <div className="flex items-end gap-3">
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {t("yourPrice")}
              </div>
              <div className="text-xl font-extrabold text-primary leading-tight">
                ₹{l.pricePerUnit}
                <span className="text-xs font-normal text-muted-foreground">
                  /{l.unit}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground line-through">
              ₹{l.marketPrice}
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-md">
                🤖 AI: ₹{aiPrice}
              </span>
            </div>
          </div>

          {/* Farmer + location */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">👨‍🌾 {l.farmerName}</span>
            <button
              type="button"
              onClick={() => setFarmerProfileListing(l)}
              className="text-primary font-medium hover:underline flex items-center gap-0.5 shrink-0"
            >
              ⭐ {l.rating.toFixed(1)}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>📍 {l.location}</span>
            <span>
              🚗 {l.distance} {t("km")}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            🚚 {t("estDelivery")}: {l.delivery}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setOrderListing(l);
                setOrderQty(1);
              }}
              className="h-10 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
            >
              {t("placeOrder")}
            </button>
            <button
              type="button"
              onClick={() => setDetailListing(l)}
              className="h-10 bg-muted hover:bg-muted/70 rounded-xl text-sm font-medium transition-colors"
            >
              {t("priceTrend")}
            </button>
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-3 gap-1.5">
            <a
              href={`tel:${l.farmerPhone}`}
              className="h-9 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
            >
              📞 Call
            </a>
            <a
              href={`https://wa.me/${l.farmerPhone.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="h-9 bg-green-50 text-green-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-green-100 transition-colors"
            >
              💬 Chat
            </a>
            <button
              type="button"
              onClick={() => whatsappShare(l)}
              className="h-9 bg-orange-50 text-orange-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-orange-100 transition-colors"
            >
              📤 Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ───────────────── BROWSE TAB ───────────────── */
  const renderBrowse = () => (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="gradient-hero text-white rounded-3xl p-5 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm opacity-80 mb-1">
            {t("welcomeBuyer")}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
            Fresh produce,<br />directly from farms 🌾
          </h1>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold">{allListings.length}</div>
              <div className="text-[11px] opacity-80">Products</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold">
                {new Set(allListings.map((l) => l.farmerName)).size}
              </div>
              <div className="text-[11px] opacity-80">Farmers</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold">{orderStats.total}</div>
              <div className="text-[11px] opacity-80">My Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
          🔍
        </span>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-10 h-12 rounded-xl bg-white border-border shadow-sm"
        />
      </div>

      {/* Crop filter chips */}
      {cropTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFilterCrop("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !filterCrop
                ? "gradient-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t("allCrops")}
          </button>
          {cropTypes.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCrop(filterCrop === c ? "" : c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterCrop === c
                  ? "gradient-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🌾</div>
          <p className="text-muted-foreground font-medium">{t("noResults")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l, idx) => renderCard(l, idx))}
        </div>
      )}
    </div>
  );

  /* ───────────────── SEARCH / FILTER TAB ───────────────── */
  const renderSearch = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">🔍 {t("search")}</h2>
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4 border border-border">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("filterCrop")}</Label>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="w-full h-11 border border-input rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">{t("allCrops")}</option>
            {cropTypes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            {t("filterPrice")}: ₹0 – ₹{filterMaxPrice}
          </Label>
          <input
            type="range"
            min={1}
            max={500}
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t("filterLocation")}</Label>
          <Input
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            placeholder="e.g. Maharashtra"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" className="flex-1 h-11 rounded-xl">
            {t("applyFilters")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={() => {
              setFilterCrop("");
              setFilterMaxPrice(500);
              setFilterLocation("");
            }}
          >
            {t("clearFilters")}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l, idx) => renderCard(l, idx))}
      </div>
    </div>
  );

  /* ───────────────── ORDERS TAB ───────────────── */
  const renderOrders = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t("orders")}</h2>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: orderStats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Pending", value: orderStats.pending, color: "bg-yellow-50 text-yellow-700" },
          { label: "Accepted", value: orderStats.accepted, color: "bg-green-50 text-green-700" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-3 text-center ${s.color}`}
          >
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-[11px] font-medium opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-muted-foreground font-medium">{t("noOrders")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your orders will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o, idx) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl shadow-sm border border-border p-4 space-y-2 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[15px]">{o.cropName}</h3>
                  <p className="text-sm text-muted-foreground">
                    📦 {o.quantity} {o.unit}
                  </p>
                  {o.farmerName && (
                    <p className="text-xs text-muted-foreground">
                      👨‍🌾 {o.farmerName}
                    </p>
                  )}
                  <p className="text-sm font-bold text-primary mt-1">
                    ₹{o.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{o.date}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    o.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : o.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {o.status.toUpperCase()}
                </span>
              </div>
              {o.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => setReceiptOrder(o)}
                  className="w-full h-10 bg-muted rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
                >
                  {t("receipt")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ───────────────── PROFILE TAB ───────────────── */
  const renderProfile = () => (
    <div className="space-y-5">
      {/* Profile hero */}
      <div className="gradient-hero text-white rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
          🛒
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-sm opacity-80 mt-1">📍 {user?.location}</p>
      </div>

      {/* Spending card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
        <h3 className="font-bold mb-3">Order Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-extrabold text-green-700">
              ₹{orderStats.revenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-green-600 font-medium">
              Total Spent
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-extrabold text-blue-700">
              {orderStats.total}
            </div>
            <div className="text-[11px] text-blue-600 font-medium">
              Orders Placed
            </div>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-5 space-y-4">
        {(
          [
            ["✉️", t("email"), user?.email],
            ["📞", t("phone"), user?.phone],
            ["📍", t("location"), user?.location],
          ] as Array<[string, string, string | undefined]>
        ).map(([icon, label, val]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xl w-8 text-center">{icon}</span>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {label}
              </div>
              <div className="font-medium">{val || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs: Record<string, React.ReactNode> = {
    browse: renderBrowse(),
    search: renderSearch(),
    orders: renderOrders(),
    profile: renderProfile(),
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-5xl mx-auto">
      {tabs[activeTab] ?? renderBrowse()}

      {/* ───── Price Trend Detail Modal ───── */}
      {detailListing && !orderListing && (
        <Dialog
          open={!!detailListing}
          onOpenChange={() => setDetailListing(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {detailListing.cropName}
              </DialogTitle>
            </DialogHeader>
            <img
              src={detailListing.imageUrl}
              alt={detailListing.cropName}
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <DemandBadge level={detailListing.demandLevel} />
                {isFraud(detailListing) && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                    ⚠️ {t("fraudWarning")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="text-[11px] text-green-700 font-medium">
                    Farmer Price
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    ₹{detailListing.pricePerUnit}
                  </div>
                  <div className="text-xs text-green-600">
                    /{detailListing.unit}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="text-[11px] text-gray-600 font-medium">
                    Market Price
                  </div>
                  <div className="text-2xl font-bold text-gray-600">
                    ₹{detailListing.marketPrice}
                  </div>
                  <div className="text-xs text-gray-500">
                    /{detailListing.unit}
                  </div>
                </div>
              </div>

              {detailListing.pricePerUnit < detailListing.marketPrice && (
                <div className="bg-green-500 text-white rounded-xl px-3 py-2.5 text-center font-bold text-sm">
                  🎉 Save{" "}
                  {Math.round(
                    (1 -
                      detailListing.pricePerUnit / detailListing.marketPrice) *
                      100,
                  )}
                  % vs Market Price!
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <div className="text-[11px] text-purple-600 font-medium">
                    AI Suggested Fair Price
                  </div>
                  <div className="text-base font-bold text-purple-700">
                    ₹{Math.round(detailListing.marketPrice * 0.85)}/
                    {detailListing.unit}
                  </div>
                </div>
              </div>

              {detailListing.description && (
                <p className="text-sm text-muted-foreground">
                  {detailListing.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>📍 {detailListing.location}</span>
                <span>•</span>
                <span>🚗 {detailListing.distance} km</span>
                <span>•</span>
                <span>🚚 {detailListing.delivery}</span>
              </div>

              {/* Price trend chart */}
              {trendData.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">
                    {t("priceHistory")}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={trendData}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartTooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#6F8442"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Farmer info */}
              <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                <div className="text-3xl">👨‍🌾</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {detailListing.farmerName}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={detailListing.rating} />
                    <span className="text-xs text-muted-foreground">
                      {detailListing.rating} ({detailListing.reviewCount}{" "}
                      reviews)
                    </span>
                  </div>
                  {detailListing.verified && (
                    <div className="text-xs text-green-600 mt-0.5">
                      {t("verifiedBadge")}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${detailListing.farmerPhone}`}
                  className="h-12 bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-colors"
                >
                  📞 Call Farmer
                </a>
                <a
                  href={`https://wa.me/${detailListing.farmerPhone.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 transition-colors"
                >
                  💬 WhatsApp
                </a>
              </div>

              {/* Review form */}
              <div className="border border-border rounded-xl p-3 space-y-2">
                <div className="font-semibold text-sm">{t("writeReview")}</div>
                <div className="flex gap-1">
                  <StarRating
                    rating={reviewScore}
                    interactive
                    onRate={setReviewScore}
                  />
                </div>
                <Input
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Your review..."
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    try {
                      if (detailListing) {
                        await api.addRating({
                          farmerId: detailListing.farmerId,
                          score: reviewScore,
                          review: reviewText,
                        });
                      }
                      toast.success("Review submitted!");
                      setReviewText("");
                    } catch {
                      toast.error("Failed to submit review");
                    }
                  }}
                >
                  {t("submitReview")}
                </Button>
              </div>

              <Button
                type="button"
                className="w-full h-12 font-semibold"
                onClick={() => {
                  setOrderListing(detailListing);
                  setOrderQty(1);
                }}
              >
                {t("placeOrder")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ───── Order Modal ───── */}
      {orderListing && (
        <Dialog
          open={!!orderListing}
          onOpenChange={() => setOrderListing(null)}
        >
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold">{t("placeOrder")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-3">
                <img
                  src={orderListing.imageUrl}
                  alt={orderListing.cropName}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <div className="font-bold">{orderListing.cropName}</div>
                  <div className="text-sm text-muted-foreground">
                    ₹{orderListing.pricePerUnit}/{orderListing.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    👨‍🌾 {orderListing.farmerName}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-sm">
                  {t("orderQty")} ({orderListing.unit})
                </Label>
                <Input
                  type="number"
                  value={orderQty}
                  min={1}
                  max={orderListing.quantity}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="bg-muted rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Total
                </span>
                <span className="text-lg font-extrabold text-primary">
                  ₹{(orderQty * orderListing.pricePerUnit).toLocaleString()}
                </span>
              </div>
              <Button
                type="button"
                onClick={placeOrder}
                className="w-full h-12 font-semibold"
              >
                {t("confirmOrder")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ───── Farmer Profile Modal ───── */}
      {farmerProfileListing && (
        <Dialog
          open={!!farmerProfileListing}
          onOpenChange={() => setFarmerProfileListing(null)}
        >
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold">
                👨‍🌾 {t("viewProfile")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-center py-2">
                <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-4xl mx-auto">
                  👨‍🌾
                </div>
                <div className="text-xl font-bold mt-3">
                  {farmerProfileListing.farmerName}
                </div>
                {farmerProfileListing.verified && (
                  <div className="text-sm text-green-600">
                    {t("verifiedBadge")}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  📍 {farmerProfileListing.location}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {farmerProfileListing.rating}
                  </div>
                  <div className="flex justify-center mt-1">
                    <StarRating rating={farmerProfileListing.rating} />
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {farmerProfileListing.reviewCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
              </div>
              {/* Real reviews from API */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {farmerReviews.length > 0
                  ? farmerReviews.map((r, i) => (
                      <div key={i} className="bg-muted rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {r.buyerName || `Buyer ${i + 1}`}
                          </span>
                          <StarRating rating={r.score} />
                        </div>
                        {r.review && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {r.review}
                          </div>
                        )}
                      </div>
                    ))
                  : ["Great quality!", "Fast delivery", "Good price"].map(
                      (review, i) => (
                        <div key={i} className="bg-muted rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              Buyer {i + 1}
                            </span>
                            <StarRating rating={5 - i} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {review}
                          </div>
                        </div>
                      ),
                    )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${farmerProfileListing.farmerPhone}`}
                  className="h-12 bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-blue-600 transition-colors"
                >
                  📞 Call
                </a>
                <a
                  href={`https://wa.me/${farmerProfileListing.farmerPhone.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-600 transition-colors"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {receiptOrder && (
        <ReceiptModal
          open={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={{
            id: receiptOrder.id,
            cropName: receiptOrder.cropName,
            quantity: receiptOrder.quantity,
            unit: receiptOrder.unit,
            totalPrice: receiptOrder.totalPrice,
            farmerName: receiptOrder.farmerName || "Farmer",
            buyerName: user?.name || "Buyer",
            date: receiptOrder.date,
            status: receiptOrder.status,
          }}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;