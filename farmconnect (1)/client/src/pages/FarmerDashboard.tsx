import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import { useLang } from "../LanguageContext";
import { api } from "../api";
import DemandBadge from "../components/DemandBadge";
import ReceiptModal from "../components/ReceiptModal";
import { CROP_SUGGESTIONS, MARKET_PRICES } from "../mockData";

interface FarmerDashboardProps {
  activeTab: string;
  onTabChange: (t: string) => void;
}

type OrderStatus = "pending" | "accepted" | "rejected";
interface Order {
  id: string;
  _id?: string;
  listingId: string;
  cropName: string;
  buyerName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: OrderStatus;
  date: string;
}

interface Listing {
  _id?: string;
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  description: string;
  imageUrl: string;
  demandLevel: "High" | "Medium" | "Low";
}

/* ────────── skeleton while loading ────────── */
function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse border border-border">
      <div className="w-20 h-20 bg-muted rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "kg",
    price: "",
    location: user?.location || "",
    description: "",
    imagePreview: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(
    new Set(),
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef<{ start: () => void } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isVerified = !!(user?.name && user?.phone && user?.location);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, apiOrders] = await Promise.all([
          api.getMyProducts(),
          api.getMyOrders(),
        ]);
        setMyListings(
          (Array.isArray(products) ? products : []).map((p: any) => ({
            ...p,
            id: p._id,
          })),
        );
        setOrders(
          (Array.isArray(apiOrders) ? apiOrders : []).map((o: any) => ({
            id: o._id,
            _id: o._id,
            listingId: o.product,
            cropName: o.cropName,
            buyerName: o.buyerName,
            quantity: o.quantity,
            unit: o.unit,
            totalPrice: o.totalPrice,
            status: o.status,
            date: new Date(o.createdAt).toISOString().split("T")[0],
          })),
        );
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const highlightField = (fields: string[]) => {
    setHighlightedFields(new Set(fields));
    setTimeout(() => setHighlightedFields(new Set()), 1500);
  };

  const fieldClass = (fieldName: string, base = "") =>
    `${base} ${highlightedFields.has(fieldName) ? "border-green-400 bg-green-50" : ""}`;

  const handleCropInput = (val: string) => {
    setForm((f) => ({ ...f, cropName: val }));
    const filtered = CROP_SUGGESTIONS.filter(
      (c) => c.toLowerCase().startsWith(val.toLowerCase()) && val.length > 0,
    );
    setSuggestions(filtered.slice(0, 5));
    const mp = MARKET_PRICES[val.toLowerCase()];
    if (mp) {
      setMarketPrice(mp);
      setSuggestedPrice(Math.round(mp * 0.85));
    } else {
      setMarketPrice(null);
      setSuggestedPrice(null);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          location: `${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`,
        }));
        toast.success("Location detected!");
      },
      () => {
        setForm((f) => ({ ...f, location: user?.location || "India" }));
        toast.info("Using profile location");
      },
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imagePreview: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const startVoice = () => {
    const w = window as any;
    const SpeechRecognitionCtor =
      w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      toast.error(
        "Voice input not supported on this browser. Please use Chrome or Android.",
      );
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Microphone not available on this device.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        for (const track of stream.getTracks()) track.stop();

        const recog: any = new SpeechRecognitionCtor();
        recog.lang = "en-IN";
        recog.continuous = false;
        recog.interimResults = false;
        recog.maxAlternatives = 1;

        let resultReceived = false;

        recog.onstart = () => setIsListening(true);

        recog.onend = () => {
          setIsListening(false);
          if (!resultReceived) toast.info("No speech detected, please try again");
        };

        recog.onerror = (e: any) => {
          setIsListening(false);
          resultReceived = true;
          switch (e.error) {
            case "not-allowed":
            case "permission-denied":
              toast.error("Microphone access denied.");
              break;
            case "no-speech":
              toast.info("No speech detected, please try again");
              break;
            default:
              toast.error(`Voice error: ${e.error}`);
          }
        };

        recog.onresult = (e: any) => {
          resultReceived = true;
          const transcript = e.results[0][0].transcript.toLowerCase().trim();
          toast.info(`Heard: "${transcript}"`);
          const qtyMatch = transcript.match(
            /(\d+)\s*(kg|quintal|ton|dozen|litre)/,
          );
          const priceMatch = transcript.match(/(\d+)\s*rupees?/);

          // Fuzzy crop matching: try exact include first, then stem/partial match
          const words = transcript.split(/\s+/);
          let cropMatch = CROP_SUGGESTIONS.find((c) =>
            transcript.includes(c.toLowerCase()),
          );
          if (!cropMatch) {
            // Try matching singular ↔ plural and partial stems (e.g. "tomato" → "Tomatoes")
            cropMatch = CROP_SUGGESTIONS.find((c) => {
              const cl = c.toLowerCase();
              return words.some((w) => {
                if (w.length < 3) return false;
                // word starts with crop or crop starts with word
                return cl.startsWith(w) || w.startsWith(cl.replace(/e?s$/, ""));
              });
            });
          }
          if (!cropMatch) {
            // Last resort: any word in the crop name appears as a spoken word
            cropMatch = CROP_SUGGESTIONS.find((c) => {
              const parts = c.toLowerCase().split(/\s+/);
              return parts.some((p) => words.some((w) => w.length >= 3 && (p.startsWith(w) || w.startsWith(p))));
            });
          }
          // Only try to extract a city if it's NOT the crop name at the end
          const cityMatch = transcript.match(/(?:from|in|at)\s+([a-z]+)\s*$/);
          const filledFields: string[] = [];

          setForm((f) => {
            const updates: Partial<typeof f> = {};
            if (qtyMatch) {
              updates.quantity = qtyMatch[1];
              updates.unit = qtyMatch[2];
              filledFields.push("quantity", "unit");
            }
            if (priceMatch) {
              updates.price = priceMatch[1];
              filledFields.push("price");
            }
            if (cropMatch) {
              updates.cropName = cropMatch;
              filledFields.push("cropName");
            }
            if (
              cityMatch?.[1] &&
              cityMatch[1].length > 3 &&
              (!cropMatch || !cityMatch[1].includes(cropMatch.toLowerCase()))
            ) {
              const city =
                cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
              updates.location = city;
              filledFields.push("location");
            }
            return { ...f, ...updates };
          });
          if (cropMatch) handleCropInput(cropMatch);
          setTimeout(() => highlightField(filledFields), 50);
        };

        recognitionRef.current = recog;
        recog.start();
      })
      .catch(() => {
        toast.error("Please allow microphone access to use voice input.");
      });
  };

  const handleAddListing = async () => {
    if (!form.cropName || !form.quantity || !form.price) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      const mp = MARKET_PRICES[form.cropName.toLowerCase()] || 0;
      const product = await api.createProduct({
        cropName: form.cropName,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerUnit: Number(form.price),
        marketPrice: mp,
        location: form.location,
        description: form.description,
        imageUrl: form.imagePreview || "",
        demandLevel: "Medium",
      });
      setMyListings((l) => [{ ...product, id: product._id }, ...l]);
      setForm({
        cropName: "",
        quantity: "",
        unit: "kg",
        price: "",
        location: user?.location || "",
        description: "",
        imagePreview: "",
      });
      setShowForm(false);
      toast.success("Listing added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add listing");
    }
  };

  const handleOrderAction = async (
    orderId: string,
    action: "accepted" | "rejected",
  ) => {
    try {
      await api.updateOrderStatus(orderId, action);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: action } : o)),
      );
      toast.success(`Order ${action}!`);
      if (action === "accepted") {
        const order = orders.find((o) => o.id === orderId);
        if (order) setReceiptOrder({ ...order, status: action });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  };

  /* derived stats */
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const acceptedCount = orders.filter((o) => o.status === "accepted").length;
  const totalRevenue = orders
    .filter((o) => o.status === "accepted")
    .reduce((s, o) => s + o.totalPrice, 0);

  /* ───────────────── HOME TAB ───────────────── */
  const renderHome = () => (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="gradient-hero text-white rounded-3xl p-5 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">{t("welcomeFarmer")}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
              {user?.name} {isVerified && "✅"}
            </h1>
            <p className="text-xs opacity-70 mt-1.5">📍 {user?.location}</p>
          </div>
          <div className="text-5xl md:text-6xl">👨‍🌾</div>
        </div>
        {isVerified && (
          <div className="relative z-10 mt-4 inline-flex items-center gap-1 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs">
            {t("verifiedBadge")}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: "📋",
            label: "Listings",
            val: myListings.length,
            color: "bg-blue-50 text-blue-700",
          },
          {
            icon: "📦",
            label: "Pending",
            val: pendingCount,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            icon: "💰",
            label: "Revenue",
            val: `₹${totalRevenue.toLocaleString()}`,
            color: "bg-green-50 text-green-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-3 text-center ${s.color} animate-fade-in`}
          >
            <div className="text-xl">{s.icon}</div>
            <div className="text-lg font-extrabold mt-0.5">{s.val}</div>
            <div className="text-[11px] font-medium opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sell CTA */}
      <button
        type="button"
        onClick={() => {
          setShowForm(true);
          onTabChange("listings");
        }}
        className="w-full h-14 gradient-primary text-white rounded-2xl text-lg font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {t("sellCrop")}
      </button>

      {/* Recent pending orders */}
      {pendingCount > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
            Pending Orders
          </h3>
          <div className="space-y-2">
            {orders
              .filter((o) => o.status === "pending")
              .slice(0, 3)
              .map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-xl p-3 border border-yellow-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm">{o.cropName}</div>
                    <div className="text-xs text-muted-foreground">
                      👤 {o.buyerName} • {o.quantity} {o.unit}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOrderAction(o.id, "accepted")}
                      className="h-8 px-3 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrderAction(o.id, "rejected")}
                      className="h-8 px-3 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Village agent info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="font-bold text-amber-800 mb-1">
          {t("villageAgent")}
        </div>
        <p className="text-sm text-amber-700">{t("agentDesc")}</p>
        <a
          href="tel:18001801551"
          className="mt-2 inline-block text-sm font-semibold text-amber-800 underline"
        >
          📞 1800-180-1551
        </a>
      </div>

      {/* Tutorials */}
      <div>
        <h3 className="font-bold mb-3">{t("tutorials")}</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { title: "How to add a crop listing", duration: "2:30" },
            { title: "How to accept orders", duration: "1:45" },
            { title: "How to use voice input", duration: "1:15" },
          ].map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border card-hover"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                ▶️
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{v.title}</div>
                <div className="text-xs text-muted-foreground">
                  ⏱ {v.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ───────────────── LISTINGS TAB ───────────────── */
  const renderListings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("myListings")}</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-9 rounded-xl"
        >
          {showForm ? t("cancel") : `+ ${t("addListing")}`}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-border p-5 space-y-4 animate-slide-up">
          <h3 className="font-bold text-lg">{t("addListing")}</h3>

          {/* Voice Input Button */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={startVoice}
              disabled={isListening}
              className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-bold transition-all shadow-sm ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white active:scale-[0.98]"
              }`}
            >
              <span className="text-2xl">🎤</span>
              {isListening ? "Listening... Speak now!" : "Tap to Speak"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Say: &quot;100 kg tomatoes 20 rupees Pune&quot;
            </p>
          </div>

          {/* Crop name */}
          <div className="relative space-y-1.5">
            <Label className="text-sm font-semibold">
              {t("cropName")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                value={form.cropName}
                onChange={(e) => handleCropInput(e.target.value)}
                placeholder="e.g. Tomatoes"
                className={fieldClass("cropName", "h-12 rounded-xl")}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden mt-1">
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        handleCropInput(s);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {suggestedPrice && marketPrice && (
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-semibold text-amber-700">
                    AI Suggested: ₹{suggestedPrice}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                  <span className="text-sm">📊</span>
                  <span className="text-xs font-semibold text-blue-700">
                    Market Avg: ₹{marketPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Qty + unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                {t("quantity")} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="e.g. 100"
                type="number"
                className={fieldClass("quantity", "h-12 rounded-xl")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">{t("unit")}</Label>
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                className={fieldClass(
                  "unit",
                  "w-full h-12 border border-input rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                )}
              >
                {["kg", "quintal", "ton", "dozen", "litre"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              {t("pricePerUnit")} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="e.g. 20"
              type="number"
              className={fieldClass("price", "h-12 rounded-xl")}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{t("location")}</Label>
            <div className="flex gap-2">
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder={t("enterLocation")}
                className={fieldClass("location", "h-12 rounded-xl flex-1")}
              />
              <button
                type="button"
                onClick={detectLocation}
                className="h-12 px-3 bg-muted hover:bg-muted/70 rounded-xl text-sm font-medium transition-colors"
              >
                📍
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{t("description")}</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe your crop..."
              rows={2}
              className="rounded-xl"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">📷 Crop Photo</Label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {form.imagePreview ? (
              <div className="relative">
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border-2 border-green-300"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imagePreview: "" }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center justify-center gap-1 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <span className="text-2xl">📷</span>
                <span className="text-sm text-green-700 font-medium">
                  Add Photo
                </span>
                <span className="text-xs text-green-600">Tap to upload</span>
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={handleAddListing}
            className="w-full h-12 font-semibold rounded-xl"
          >
            {t("addListing")}
          </Button>
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🌾</div>
          <p className="text-muted-foreground font-medium">{t("noListings")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map((l, idx) => (
            <div
              key={l.id}
              className="bg-white rounded-2xl shadow-sm border border-border p-4 flex gap-3 card-hover animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <img
                src={
                  l.imageUrl ||
                  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop"
                }
                alt={l.cropName}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-[15px] truncate">
                      {l.cropName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {l.quantity} {l.unit} • ₹{l.pricePerUnit}/{l.unit}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📍 {l.location}
                    </p>
                  </div>
                  <DemandBadge level={l.demandLevel} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/70 transition-colors font-medium"
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.deleteProduct(l._id || l.id);
                        setMyListings((prev) =>
                          prev.filter(
                            (x) => (x._id || x.id) !== (l._id || l.id),
                          ),
                        );
                        toast.success("Listing deleted");
                      } catch {
                        toast.error("Failed to delete");
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ───────────────── ORDERS TAB ───────────────── */
  const renderOrders = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t("orders")}</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: orders.length,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Pending",
            value: pendingCount,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Accepted",
            value: acceptedCount,
            color: "bg-green-50 text-green-700",
          },
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

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-muted-foreground font-medium">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl shadow-sm border border-border p-4 space-y-3 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[15px]">{o.cropName}</h3>
                  <p className="text-sm text-muted-foreground">
                    👤 {o.buyerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    📦 {o.quantity} {o.unit} • ₹{o.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    📅 {o.date}
                  </p>
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
              {o.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOrderAction(o.id, "accepted")}
                    className="flex-1 h-10 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors active:scale-[0.98]"
                  >
                    {t("accept")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrderAction(o.id, "rejected")}
                    className="flex-1 h-10 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors active:scale-[0.98]"
                  >
                    {t("reject")}
                  </button>
                </div>
              )}
              {o.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => setReceiptOrder(o)}
                  className="w-full h-10 bg-muted rounded-xl font-semibold text-sm hover:bg-muted/80 transition-colors"
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
      {/* Hero */}
      <div className="gradient-hero text-white rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
          👨‍🌾
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        {isVerified && (
          <p className="text-sm mt-1 opacity-80">{t("verifiedBadge")}</p>
        )}
        <p className="text-sm opacity-70 mt-1">📍 {user?.location}</p>
      </div>

      {/* Revenue card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
        <h3 className="font-bold mb-3">Earnings Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-extrabold text-green-700">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-green-600 font-medium">
              Total Revenue
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-extrabold text-blue-700">
              {myListings.length}
            </div>
            <div className="text-[11px] text-blue-600 font-medium">
              Active Listings
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

      {/* Profile completeness */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
        <div className="text-sm font-semibold mb-2">Profile Completeness</div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="gradient-primary h-3 rounded-full transition-all duration-700"
            style={{
              width: `${[user?.name, user?.email, user?.phone, user?.location].filter(Boolean).length * 25}%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1.5">
          {[user?.name, user?.email, user?.phone, user?.location].filter(
            Boolean,
          ).length * 25}
          % complete
        </div>
      </div>
    </div>
  );

  const tabs: Record<string, React.ReactNode> = {
    home: renderHome(),
    listings: renderListings(),
    orders: renderOrders(),
    profile: renderProfile(),
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-5xl mx-auto">
      {tabs[activeTab] ?? renderHome()}
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
            farmerName: user?.name || "Farmer",
            buyerName: receiptOrder.buyerName,
            date: receiptOrder.date,
            status: receiptOrder.status,
          }}
        />
      )}
    </div>
  );
};

export default FarmerDashboard;