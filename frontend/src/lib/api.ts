/**
 * Typed API Client for Heritage India Frontend
 * Connects directly to the Express backend API.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  const url = `${API_BASE}${path}`;
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

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // send httpOnly cookies
  });

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
    savedSites: () => request<ApiSite[]>("/api/me/saved"),
    saveSite: (siteId: string) =>
      request(`/api/me/saved/${siteId}`, { method: "POST" }),
    removeSavedSite: (siteId: string) =>
      request(`/api/me/saved/${siteId}`, { method: "DELETE" }),
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
    create: (data: {
      siteId: string;
      guideId?: string | null;
      visitDate: string;
      partySize: number;
      userId?: string;
    }) => request<ApiBooking>("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
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
