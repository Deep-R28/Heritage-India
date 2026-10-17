"use client";

/**
 * Real authentication context driving TopNav and protected pages.
 * Connects to /api/auth/me, /api/auth/login, /api/auth/signup, /api/auth/logout.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api, type ApiUser } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initial: string;
  avatarUrl?: string | null;
  preference?: ApiUser["preference"];
}

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (dataOrEmail?: { email: string; password?: string; name?: string } | string, password?: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatUser(apiUser: ApiUser): UserProfile {
  const name = apiUser.name || "Explorer";
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    initial: name.charAt(0).toUpperCase(),
    avatarUrl: apiUser.avatarUrl,
    preference: apiUser.preference,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res?.user) {
        setUser(formatUser(res.user));
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (dataOrEmail?: { email: string; password?: string; name?: string } | string, password?: string) => {
    // Support either login({ email, password }) or login("demo@...", "Demo@1234") or fallback
    let email = "demo@heritage-india.com";
    let pwd = "Demo@1234";

    if (typeof dataOrEmail === "object" && dataOrEmail !== null) {
      email = dataOrEmail.email || email;
      pwd = dataOrEmail.password || pwd;
    } else if (typeof dataOrEmail === "string") {
      email = dataOrEmail;
      pwd = password || pwd;
    }

    const res = await api.auth.login({ email, password: pwd });
    setUser(formatUser(res.user));
    setIsLoggedIn(true);
  };

  const signup = async (data: { name: string; email: string; password: string }) => {
    const res = await api.auth.signup(data);
    setUser(formatUser(res.user));
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
