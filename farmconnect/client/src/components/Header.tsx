import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { type Language, useLang } from "../LanguageContext";
import { MOCK_NOTIFICATIONS } from "../mockData";

const Header: React.FC = () => {
  const { t, lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="sticky top-0 z-50 gradient-primary shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌾</span>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              {t("appName")}
            </span>
            <span className="hidden sm:inline text-[10px] text-white/50 ml-2 font-medium">
              {t("tagline")}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language switcher */}
          <div className="flex bg-white/10 rounded-full p-0.5 backdrop-blur-sm">
            {(["en", "te", "hi"] as Language[]).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  lang === l
                    ? "bg-white text-green-900 shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {l === "en" ? "EN" : l === "te" ? "తె" : "हि"}
              </button>
            ))}
          </div>

          {/* Notifications */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center animate-pulse-soft">
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-foreground rounded-2xl shadow-2xl shadow-black/15 border border-border/50 z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 font-semibold text-sm border-b border-border flex items-center justify-between">
                    <span>{t("notifications")}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{unread} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors ${
                          !n.read ? "bg-green-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />}
                          <div className="flex-1">
                            <div className="text-sm">{n.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User avatar & logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-white/90 font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all text-white/80 hover:text-white font-medium"
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
