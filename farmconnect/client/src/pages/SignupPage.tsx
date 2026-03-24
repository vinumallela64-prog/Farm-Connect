import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useLang } from "../LanguageContext";

interface Props {
  onGoLogin: () => void;
}

const SignupPage: React.FC<Props> = ({ onGoLogin }) => {
  const { signup } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
  });
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Name, email, phone and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup({ ...form, role });
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<[keyof typeof form, string, string, string]> = [
    ["name", "text", t("name"), "Enter your full name"],
    ["email", "email", t("email"), "you@example.com"],
    ["phone", "tel", t("phone"), "+91 98765 43210"],
    ["password", "password", t("password"), "Min 6 characters"],
    ["location", "text", t("location"), "City, State"],
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200')] bg-cover bg-center opacity-15" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in">
            <span className="text-7xl mb-6 block animate-float">🚜</span>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight">
              Join India's<br />Farm Network
            </h1>
            <p className="text-lg text-white/70 mt-4 max-w-md leading-relaxed">
              Whether you grow it or buy it, FarmConnect brings the farm to your doorstep with transparency and trust.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: "✅", text: "Verified farmer profiles with ratings" },
                { icon: "💰", text: "AI-powered fair price suggestions" },
                { icon: "🚚", text: "Direct farm-to-door delivery tracking" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-white/80">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 bg-gradient-to-b from-background to-secondary/30">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="text-5xl mb-2 animate-float">🌾</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: '#1a3a1a' }}>
              {t("appName")}
            </h1>
          </div>

          {/* Signup card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 space-y-5 border border-border/50">
            <div>
              <h2 className="text-2xl font-bold">{t("signup")}</h2>
              <p className="text-sm text-muted-foreground mt-1">Create your account to get started</p>
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("role")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["farmer", "buyer"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                      role === r
                        ? "border-primary bg-gradient-to-br from-green-50 to-emerald-50 shadow-md shadow-green-100"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    {role === r && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">✓</span>
                    )}
                    <span className="text-3xl">{r === "farmer" ? "👨‍🌾" : "🛒"}</span>
                    <span className="font-semibold text-sm">{t(r)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
              {fields.map(([field, type, label, placeholder]) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    {label}
                    {field !== "location" && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  <Input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="h-11 rounded-xl bg-muted/50 border-0 focus:bg-white transition-colors"
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-scale-in">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-xl gradient-primary hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-green-900/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : t("signup")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onGoLogin}
                className="text-primary font-semibold hover:underline"
              >
                {t("login")}
              </button>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>🔒 Secure</span>
            <span>•</span>
            <span>🇮🇳 Made in India</span>
            <span>•</span>
            <span>✅ Verified Farmers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
