import type React from "react";
import { useLang } from "../LanguageContext";

interface BottomNavProps {
  userRole: "farmer" | "buyer";
  active: string;
  onChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
  userRole,
  active,
  onChange,
}) => {
  const { t } = useLang();

  const farmerTabs = [
    { id: "home", icon: "🏠", label: t("home") },
    { id: "listings", icon: "📋", label: t("myListings") },
    { id: "orders", icon: "📦", label: t("orders") },
    { id: "profile", icon: "👤", label: t("profile") },
  ];

  const buyerTabs = [
    { id: "browse", icon: "🌾", label: t("browse") },
    { id: "search", icon: "🔍", label: t("search") },
    { id: "orders", icon: "📦", label: t("orders") },
    { id: "profile", icon: "👤", label: t("profile") },
  ];

  const tabs = userRole === "farmer" ? farmerTabs : buyerTabs;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden pb-safe">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all relative ${
                active === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active === tab.id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              <span className={`text-xl transition-transform ${active === tab.id ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold leading-none">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar nav */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-56 lg:w-64 gradient-primary flex-col z-30 shadow-xl">
        <div className="flex-1 py-4 px-3 space-y-1">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active === tab.id
                  ? "bg-white/15 text-white shadow-md shadow-black/10"
                  : "text-white/60 hover:bg-white/10 hover:text-white/90"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              {active === tab.id && (
                <span className="ml-auto w-1.5 h-6 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xs text-white/50 font-medium">Need Help?</div>
            <a href="tel:18001801551" className="text-xs text-white/80 font-semibold hover:text-white mt-1 block">
              📞 1800-180-1551
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
