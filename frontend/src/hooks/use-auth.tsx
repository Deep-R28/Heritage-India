"use client";

/**
 * Mock auth-state flag driving which TopNav variant renders (Section 4).
 * Not a real auth system — swap for a real provider when the backend exists.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface MockUser {
  name: string;
  initial: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: MockUser | null;
  login: (user?: MockUser) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "heritage-auth";
const DEFAULT_USER: MockUser = { name: "Eleanor Vance", initial: "E" };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === "true") {
      setIsLoggedIn(true);
      setUser(DEFAULT_USER);
    }
  }, []);

  const login = (nextUser: MockUser = DEFAULT_USER) => {
    setIsLoggedIn(true);
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
