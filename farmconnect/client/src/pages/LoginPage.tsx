import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useLang } from "../LanguageContext";

interface Props {
  onGoSignup: () => void;
}

const LoginPage: React.FC<Props> = ({ onGoSignup }) => {
  const { loginWithCredentials } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    try {
      await loginWithCredentials(demoEmail, "password123");
    } catch (err: any) {
      setError(err.message || "Demo login failed. Run 'npm run seed' in server first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero (visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in">
            <span className="text-7xl mb-6 block animate-float">🌾</span>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight">
              Fresh from<br />Farm to You
            </h1>
            <p className="text-lg text-white/70 mt-4 max-w-md leading-relaxed">
              India's trusted marketplace connecting farmers directly with buyers. Fair prices, verified quality, zero middlemen.
            </p>
            <div className="flex gap-6 mt-8">
              {[
                { val: "10K+", label: "Farmers" },
                { val: "50K+", label: "Orders" },
                { val: "100+", label: "Cities" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-xs text-white/50 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-20 -right-10 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:mb-10">
            <div className="text-6xl mb-3 animate-float">🌾</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: '#1a3a1a' }}>
              {t("appName")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{t("tagline")}</p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 space-y-5 border border-border/50">
            <div>
              <h2 className="text-2xl font-bold">{t("login")}</h2>
              <p className="text-sm text-muted-foreground mt-1">Welcome back! Sign in to continue</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("email")}</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  type="email"
                  className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-white transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("password")}</Label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-white transition-colors pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-scale-in">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-xl gradient-primary hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-green-900/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : t("login")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New to FarmConnect?{" "}
              <button
                type="button"
                onClick={onGoSignup}
                className="text-primary font-semibold hover:underline"
              >
                {t("signup")}
              </button>
            </p>
          </div>

          {/* Demo access card */}
          <div className="mt-4 bg-white rounded-2xl shadow-md shadow-black/5 p-5 space-y-3 border border-border/50 animate-fade-in">
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-border" />
              <p className="text-xs text-muted-foreground font-medium px-2">
                Quick Demo Access
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("ravi@farm.com")}
                className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-xl py-3 text-sm font-semibold hover:shadow-md hover:shadow-green-100 hover:border-green-300 transition-all active:scale-[0.97]"
              >
                <span className="text-xl block mb-1">👨‍🌾</span>
                Farmer Demo
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("priya@buy.com")}
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 rounded-xl py-3 text-sm font-semibold hover:shadow-md hover:shadow-blue-100 hover:border-blue-300 transition-all active:scale-[0.97]"
              >
                <span className="text-xl block mb-1">🛒</span>
                Buyer Demo
              </button>
            </div>
          </div>

          {/* Trust badges */}
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

export default LoginPage;
