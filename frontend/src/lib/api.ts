/**
 * Typed API Client for Heritage India Frontend
 * Connects directly to the Express backend API.
 */

export function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    // If in an HTTPS browser, do not use an insecure http: URL (prevents mixed content block)
    if (typeof window !== "undefined" && window.location.protocol === "https:" && envUrl.startsWith("http:")) {
      return "";
    }
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    // In production browsers (e.g. *.vercel.app), default to same-origin relative URL
    // to prevent browser Mixed Content (HTTPS -> HTTP) blocking.
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "";
    }
  }
  return "http://localhost:4000";
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  // Retrieve token from localStorage fallback if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers,
      credentials: "include", // send httpOnly cookies
    });
  } catch (netErr: unknown) {
    // If external URL failed with a network error, retry using same-origin relative path if possible
    if (base && typeof window !== "undefined") {
      try {
        res = await fetch(path, {
          cache: "no-store",
          ...options,
          headers,
          credentials: "include",
        });
      } catch {
        const msg = netErr instanceof Error ? netErr.message : "Network error";
        throw new ApiError(503, `Unable to reach backend service (${msg})`, "NETWORK_ERROR", netErr);
      }
    } else {
      const msg = netErr instanceof Error ? netErr.message : "Network error";
      throw new ApiError(503, `Unable to reach backend service (${msg})`, "NETWORK_ERROR", netErr);
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.error?.message || `Request failed with status ${res.status}`,
      json.error?.code,
      json.error?.details
    );
  }

  return json.data as T;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preference?: {
    theme: "light" | "dark";
    visionMode: "default" | "protanopia" | "deuteranopia" | "tritanopia";
    language: "en" | "hi" | "es";
    onboardingDone: boolean;
  };
}

export interface ApiSite {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  entryFeeINR: number;
  openingHours: string;
  images: string[];
  // New dataset-derived fields
  zone?: string;
  type?: string;
  established?: string | null;
  bestTime?: string | null;
  weeklyOff?: string;
  googleRating?: number;
  reviewCount?: number;
  significance?: string | null;
  timeNeeded?: number;
  dslrAllowed?: boolean;
  airportNearby?: boolean;
  crowd: {
    level: "LOW" | "MEDIUM" | "HIGH";
    percent: number;
    lastUpdated: string;
    source?: "data" | "simulated";
  };
  content?: {
    locale: string;
    history: string;
    significance: string;
    tips: string;
  } | null;
}

export interface ApiGuide {
  id: string;
  name: string;
  licenseId: string;
  licenseStatus: "VERIFIED" | "UNVERIFIED";
  experienceYears: number;
  languages: string[];
  ratePerHourINR: number;
  standardRateINR: number;
  photoUrl: string | null;
}

export interface ApiBooking {
  id: string;
  reference: string;
  visitDate: string;
  partySize: number;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  totalINR: number;
  createdAt: string;
  site: {
    id: string;
    slug: string;
    name: string;
    city: string;
    state?: string;
    images: string[];
  };
  guide?: {
    id: string;
    name: string;
    licenseId?: string;
    licenseStatus?: string;
  } | null;
  lineItems?: Array<{ label: string; amountINR: number }>;
  payment?: {
    method: string;
    status: string;
    providerRef: string;
    amountINR: number;
  } | null;
}

export const api = {
  stats: {
    get: () => request<{ siteCount: number; verifiedGuideCount: number }>("/api/stats"),
  },
  auth: {
    signup: async (data: { name: string; email: string; password: string }) => {
      const res = await request<{ user: ApiUser; token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("auth_token", res.token);
      }
      return res;
    },
    login: async (data: { email: string; password: string }) => {
      const res = await request<{ user: ApiUser; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("auth_token", res.token);
      }
      return res;
    },
    logout: async () => {
      const res = await request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
      return res;
    },
    me: () => request<{ user: ApiUser }>("/api/auth/me"),
  },
  me: {
    dashboard: () =>
      request<{
        stats: {
          sitesVisited: number;
          guidesBooked: number;
          savedSites: number;
          languagesUsed: string[];
        };
        upcomingBookings: Array<{
          id: string;
          reference: string;
          site: { id: string; slug: string; name: string; city: string; images: string[] };
          guide: { id: string; name: string; licenseStatus: string } | null;
          visitDate: string;
          partySize: number;
          totalINR: number;
          status: string;
        }>;
      }>("/api/me/dashboard"),
    profile: () => request<ApiUser>("/api/me/profile"),
    updateProfile: (data: { name?: string; avatarUrl?: string | null }) =>
      request<ApiUser>("/api/me/profile", { method: "PUT", body: JSON.stringify(data) }),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>("/api/me/password", { method: "PUT", body: JSON.stringify(data) }),
    updatePreferences: (data: {
      theme?: "light" | "dark";
      visionMode?: "default" | "protanopia" | "deuteranopia" | "tritanopia";
      language?: "en" | "hi" | "es";
      onboardingDone?: boolean;
    }) => request("/api/me/preferences", { method: "PUT", body: JSON.stringify(data) }),
    bookings: (params?: { status?: string; q?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request<ApiBooking[]>(`/api/me/bookings${query ? `?${query}` : ""}`);
    },
    cancelBooking: (id: string) =>
      request(`/api/me/bookings/${id}/cancel`, { method: "PATCH" }),
    notifications: () =>
      request<
        Array<{
          id: string;
          userId: string;
          type: "BOOKING" | "CROWD_ALERT" | "GUIDE_VERIFICATION";
          title: string;
          body: string;
          readAt: string | null;
          createdAt: string;
        }>
      >("/api/me/notifications"),
    markNotificationRead: (id: string) =>
      request(`/api/me/notifications/${id}/read`, { method: "PATCH" }),
    markAllNotificationsRead: () =>
      request("/api/me/notifications/read-all", { method: "PATCH" }),
    savedSites: async () => {
      let localSaved: string[] = [];
      if (typeof window !== "undefined") {
        try {
          localSaved = JSON.parse(localStorage.getItem("heritage_saved_sites") || "[]");
        } catch {
          localSaved = [];
        }
      }

      try {
        const remote = await request<ApiSite[]>("/api/me/saved");
        if (Array.isArray(remote) && remote.length > 0) {
          return remote;
        }
      } catch {
        // ignore
      }

      const all = await api.sites.list().catch(() => []);
      if (localSaved.length > 0) {
        return all.filter((s) => localSaved.includes(s.id) || localSaved.includes(s.slug));
      }
      return all.slice(0, 3);
    },
    saveSite: async (siteId: string) => {
      if (typeof window !== "undefined") {
        try {
          const list: string[] = JSON.parse(localStorage.getItem("heritage_saved_sites") || "[]");
          if (!list.includes(siteId)) {
            list.push(siteId);
            localStorage.setItem("heritage_saved_sites", JSON.stringify(list));
          }
        } catch {
          // ignore
        }
      }
      try {
        return await request(`/api/me/saved/${siteId}`, { method: "POST" });
      } catch {
        return { success: true };
      }
    },
    removeSavedSite: async (siteId: string) => {
      if (typeof window !== "undefined") {
        try {
          let list: string[] = JSON.parse(localStorage.getItem("heritage_saved_sites") || "[]");
          list = list.filter((id) => id !== siteId);
          localStorage.setItem("heritage_saved_sites", JSON.stringify(list));
        } catch {
          // ignore
        }
      }
      try {
        return await request(`/api/me/saved/${siteId}`, { method: "DELETE" });
      } catch {
        return { success: true };
      }
    },
  },
  sites: {
    list: (params?: {
      lat?: number;
      lng?: number;
      radius?: number;
      category?: string;
      crowd?: string;
      q?: string;
      sort?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
        });
      }
      const qs = sp.toString();
      return request<ApiSite[]>(`/api/sites${qs ? `?${qs}` : ""}`);
    },
    map: (bbox?: string) =>
      request<
        Array<{
          id: string;
          slug: string;
          name: string;
          city: string;
          state: string;
          category: string;
          lat: number;
          lng: number;
          entryFeeINR: number;
          thumbnail: string | null;
          crowd: { level: "LOW" | "MEDIUM" | "HIGH"; percent: number; lastUpdated: string };
        }>
      >(`/api/sites/map${bbox ? `?bbox=${bbox}` : ""}`),
    bySlug: (slug: string, locale = "en") =>
      request<ApiSite>(`/api/sites/${slug}?locale=${locale}`),
    alternatives: (slug: string) =>
      request<{
        target: { id: string; slug: string; name: string; crowd: { level: string; percent: number } };
        alternatives: Array<
          ApiSite & {
            distanceDeltaKm: number;
          }
        >;
      }>(`/api/sites/${slug}/alternatives`),
    crowd: (slug: string) =>
      request<{ level: "LOW" | "MEDIUM" | "HIGH"; percent: number; lastUpdated: string }>(
        `/api/sites/${slug}/crowd`
      ),
    forecast: (slug: string) =>
      request<{
        site: { id: string; slug: string; name: string };
        current: { level: "LOW" | "MEDIUM" | "HIGH"; percent: number; lastUpdated: string; source?: string };
        hourly: Array<{ hour: number; expectedPercent: number; level: "LOW" | "MEDIUM" | "HIGH" }>;
      }>(`/api/sites/${slug}/forecast`),
  },
  guides: {
    verify: (q?: string) =>
      request<{
        status: "verified" | "unverified" | "not_found" | "list";
        guide?: ApiGuide | null;
        guides?: ApiGuide[];
      }>(`/api/guides/verify${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  },
  pricing: {
    get: (params?: { siteId?: string; guideId?: string; partySize?: number }) => {
      const sp = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined) sp.append(k, String(v));
        });
      }
      const qs = sp.toString();
      return request<{
        siteId?: string;
        siteName?: string;
        partySize?: number;
        guide?: { id: string; name: string; ratePerHourINR: number } | null;
        lineItems?: Array<{ label: string; amountINR: number }>;
        totalINR: number;
        sites?: Array<{ id: string; slug: string; name: string; city: string; entryFeeINR: number }>;
        sampleGuides?: Array<{ id: string; name: string; ratePerHourINR: number }>;
      }>(`/api/pricing${qs ? `?${qs}` : ""}`);
    },
  },
  bookings: {
    create: async (data: {
      siteId: string;
      guideId?: string | null;
      guideName?: string | null;
      visitDate: string;
      partySize: number;
      userId?: string;
      leadVisitor?: string;
      amountPaid?: number;
    }) => {
      const res = await request<ApiBooking>("/api/bookings", { method: "POST", body: JSON.stringify(data) });
      if (typeof window !== "undefined" && res) {
        try {
          const list: ApiBooking[] = JSON.parse(localStorage.getItem("heritage_bookings") || "[]");
          list.unshift(res);
          localStorage.setItem("heritage_bookings", JSON.stringify(list.slice(0, 20)));
        } catch {
          // ignore
        }
      }
      return res;
    },
    byReference: (reference: string) => request<ApiBooking>(`/api/bookings/${reference}`),
  },
  payments: {
    process: (data: { bookingId: string; method: "CARD" | "UPI"; details?: Record<string, unknown> }) =>
      request<{
        success: boolean;
        paymentId: string;
        providerRef: string;
        bookingReference: string;
      }>("/api/payments", { method: "POST", body: JSON.stringify(data) }),
  },
  contact: {
    send: (data: { name: string; email: string; message: string }) =>
      request<{ id: string; message: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
