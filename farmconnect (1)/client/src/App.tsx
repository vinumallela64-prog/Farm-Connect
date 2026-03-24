import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { LanguageProvider } from "./LanguageContext";
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import HelpButton from "./components/HelpButton";
import BuyerDashboard from "./pages/BuyerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

type Page = "login" | "signup";

const AppInner: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [page, setPage] = useState<Page>("login");
  const [farmerTab, setFarmerTab] = useState("home");
  const [buyerTab, setBuyerTab] = useState("browse");

  if (!isLoggedIn) {
    return page === "login" ? (
      <LoginPage onGoSignup={() => setPage("signup")} />
    ) : (
      <SignupPage onGoLogin={() => setPage("login")} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user?.role === "farmer" ? (
        <>
          <div className="md:pl-56 lg:pl-64">
            <FarmerDashboard activeTab={farmerTab} onTabChange={setFarmerTab} />
          </div>
          <BottomNav
            userRole="farmer"
            active={farmerTab}
            onChange={setFarmerTab}
          />
        </>
      ) : (
        <>
          <div className="md:pl-56 lg:pl-64">
            <BuyerDashboard activeTab={buyerTab} onTabChange={setBuyerTab} />
          </div>
          <BottomNav
            userRole="buyer"
            active={buyerTab}
            onChange={setBuyerTab}
          />
        </>
      )}
      <HelpButton />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AuthProvider>
      <AppInner />
      <Toaster />
    </AuthProvider>
  </LanguageProvider>
);

export default App;
