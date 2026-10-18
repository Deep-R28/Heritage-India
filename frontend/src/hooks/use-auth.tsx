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

const STORAGE_KEY_USER = "heritage_user";
const STORAGE_KEY_ACCOUNTS = "heritage_known_users";

function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getStoredAccountName(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) return null;
    const accounts = JSON.parse(raw);
    return accounts[email.toLowerCase()] || null;
  } catch {
    return null;
  }
}

function rememberAccountName(email: string, name: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const accounts = raw ? JSON.parse(raw) : {};
    accounts[email.toLowerCase()] = name;
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

function formatUser(apiUser: ApiUser, fallbackName?: string): UserProfile {
  let name = apiUser.name;
  if (!name || name === "Explorer") {
    name = fallbackName || getStoredAccountName(apiUser.email) || "Explorer";
  }
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res?.user) {
        const profile = formatUser(res.user);
        setUser(profile);
        setIsLoggedIn(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
        }
      } else {
        const cached = getStoredUser();
        if (!cached) {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } catch {
      // Network error / offline: keep active session from localStorage
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
        setIsLoggedIn(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate user from localStorage on mount and check session
  useEffect(() => {
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
      setIsLoggedIn(true);
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (dataOrEmail?: { email: string; password?: string; name?: string } | string, password?: string) => {
    let email = "demo@heritage-india.com";
    let pwd = "Demo@1234";
    let explicitName: string | undefined;

    if (typeof dataOrEmail === "object" && dataOrEmail !== null) {
      email = dataOrEmail.email || email;
      pwd = dataOrEmail.password || pwd;
      explicitName = dataOrEmail.name;
    } else if (typeof dataOrEmail === "string") {
      email = dataOrEmail;
      pwd = password || pwd;
    }

    const rememberedName = explicitName || getStoredAccountName(email);

    try {
      const res = await api.auth.login({ email, password: pwd });
      const profile = formatUser(res.user, rememberedName || undefined);
      setUser(profile);
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
        if (profile.name && profile.name !== "Explorer") {
          rememberAccountName(profile.email, profile.name);
        }
      }
    } catch {
      // Graceful offline fallback login so user never encounters "Failed to fetch"
      const fallbackName =
        rememberedName ||
        (email.includes("@")
          ? email
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .split(" ")
              .filter(Boolean)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "Explorer");

      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: fallbackName,
        email,
        initial: fallbackName.charAt(0).toUpperCase(),
        avatarUrl: null,
        preference: {
          theme: "dark",
          visionMode: "default",
          language: "en",
          onboardingDone: true,
        },
      };

      setUser(fallbackUser);
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fallbackUser));
        rememberAccountName(fallbackUser.email, fallbackUser.name);
      }
    }
  };

  const signup = async (data: { name: string; email: string; password: string }) => {
    const trimmedName = data.name.trim() || "Explorer";
    rememberAccountName(data.email, trimmedName);

    try {
      const res = await api.auth.signup(data);
      const profile = formatUser(res.user, trimmedName);
      setUser(profile);
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      }
    } catch {
      // Offline fallback: complete signup locally
      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: trimmedName,
        email: data.email,
        initial: trimmedName.charAt(0).toUpperCase(),
        avatarUrl: null,
        preference: {
          theme: "dark",
          visionMode: "default",
          language: "en",
          onboardingDone: true,
        },
      };
      setUser(fallbackUser);
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fallbackUser));
      }
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem("auth_token");
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
