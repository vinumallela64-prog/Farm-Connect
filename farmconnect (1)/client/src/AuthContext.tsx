import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

export interface UserProfile {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: "farmer" | "buyer";
  verified?: boolean;
  token?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  signup: (data: { name: string; email: string; phone: string; password: string; location: string; role: string }) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  signup: async () => {},
  loginWithCredentials: async () => {},
  logout: () => {},
  isLoggedIn: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("farmconnect_user");
    const token = localStorage.getItem("farmconnect_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("farmconnect_user");
        localStorage.removeItem("farmconnect_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (profile: UserProfile) => {
    const p = { ...profile, id: profile._id || profile.id };
    setUser(p);
    localStorage.setItem("farmconnect_user", JSON.stringify(p));
    if (profile.token) {
      localStorage.setItem("farmconnect_token", profile.token);
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    login(data);
  };

  const signup = async (body: { name: string; email: string; phone: string; password: string; location: string; role: string }) => {
    const data = await api.signup(body);
    login(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("farmconnect_user");
    localStorage.removeItem("farmconnect_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithCredentials, logout, isLoggedIn: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
