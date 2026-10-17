/**
 * Data layer for Heritage India.
 * Fetches real data from the backend API, falling back to local seed data
 * for offline and Next.js static build pre-rendering.
 */
import nearbySitesRaw from "@/data/nearby-sites.json";
import crowdLevelsRaw from "@/data/crowd-levels.json";
import guideRegistryRaw from "@/data/guide-registry.json";
import pricingRaw from "@/data/pricing.json";
import bookingsRaw from "@/data/bookings.json";
import notificationsRaw from "@/data/notifications.json";
import type { PricingData } from "@/components/pricing/pricing-types";
import { api, type ApiSite } from "@/lib/api";

export interface Site {
  id: string;
  slug: string;
  name: string;
  category: string;
  region: string;
  lat: number;
  lng: number;
  distanceKm: number;
  image: string;
  gallery: string[];
  crowdPercent: number;
  priceInr: number;
  openHours: string;
  summary: string;
  history: string;
  lastUpdated?: string;
  zone?: string;
  type?: string;
  googleRating?: number;
  bestTime?: string | null;
  weeklyOff?: string;
  timeNeeded?: number;
  /** Non-English variants of `summary`/`history`, keyed by language code. */
  translations?: Partial<Record<"hi" | "es", { summary?: string; history?: string }>>;
}

export interface Guide {
  id: string;
  name: string;
  asiId: string | null;
  verified: boolean;
  photo: string | null;
  experienceYears: number;
  languages: string[];
  specialty: string;
  region: string;
  rateInr: number;
  rating: number;
  /** Non-English variants of `specialty`, keyed by language code. */
  translations?: Partial<Record<"hi" | "es", { specialty?: string }>>;
}

export interface Booking {
  id: string;
  type: "guide" | "site";
  siteName: string;
  region: string;
  guideName: string | null;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  priceInr: number;
  image: string;
}

export interface NotificationItem {
  id: string;
  type: "booking" | "crowd-alert" | "guide-verification";
  variant?: "confirmed" | "cancelled";
  guide?: string;
  site?: string;
  percent?: number;
  eventDate?: string;
  date: string;
  read: boolean;
}

const fallbackSites = nearbySitesRaw as Site[];
const fallbackGuides = guideRegistryRaw as Guide[];
const fallbackBookings = bookingsRaw as Booking[];
const fallbackNotifications = notificationsRaw as NotificationItem[];

function mapApiSiteToSite(s: ApiSite): Site {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category,
    region: `${s.city}, ${s.state}`,
    lat: s.lat,
    lng: s.lng,
    distanceKm: s.distanceKm ?? 2.5,
    image: s.images[0] || fallbackSites[0].image,
    gallery: s.images,
    crowdPercent: s.crowd.percent,
    priceInr: s.entryFeeINR,
    openHours: s.openingHours,
    summary: s.content?.significance || s.significance || s.name,
    history: s.content?.history || "",
    lastUpdated: s.crowd.lastUpdated,
    zone: s.zone,
    type: s.type,
    googleRating: s.googleRating,
    bestTime: s.bestTime,
    weeklyOff: s.weeklyOff,
    timeNeeded: s.timeNeeded,
  };
}

export async function getSites(): Promise<Site[]> {
  try {
    const apiSites = await api.sites.list();
    if (apiSites && apiSites.length > 0) {
      return apiSites.map(mapApiSiteToSite);
    }
  } catch (err: any) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.warn("Could not reach backend API in getSites(), using catalog fallback:", err?.message || err);
    }
  }
  return fallbackSites;
}

export async function getSiteBySlug(slug: string, locale = "en"): Promise<Site | undefined> {
  try {
    const s = await api.sites.bySlug(slug, locale);
    if (s) {
      return mapApiSiteToSite(s);
    }
  } catch {
    // fallback
  }
  return fallbackSites.find((s) => s.slug === slug);
}

export async function getAlternativesFor(siteId: string, count = 2): Promise<Site[]> {
  try {
    const site = fallbackSites.find((s) => s.id === siteId);
    if (site) {
      const res = await api.sites.alternatives(site.slug);
      if (res?.alternatives && res.alternatives.length > 0) {
        return res.alternatives.slice(0, count).map(mapApiSiteToSite);
      }
    }
  } catch {
    // fallback
  }
  return fallbackSites.filter((s) => s.id !== siteId && s.crowdPercent < 50).slice(0, count);
}

export async function getCrowdLevel(siteId: string) {
  try {
    const site = fallbackSites.find((s) => s.id === siteId);
    if (site) {
      // Try data-driven forecast first
      try {
        const forecast = await api.sites.forecast(site.slug);
        if (forecast?.hourly && forecast.hourly.length > 0) {
          return {
            current: forecast.current.percent,
            updatedAt: forecast.current.lastUpdated,
            hourly: forecast.hourly.map((h) => h.expectedPercent),
          };
        }
      } catch {
        // fallback to standard crowd endpoint
      }

      const crowd = await api.sites.crowd(site.slug);
      if (crowd) {
        return {
          current: crowd.percent,
          updatedAt: crowd.lastUpdated,
          hourly: [20, 35, 55, 75, 85, 90, 65, 40, 20],
        };
      }
    }
  } catch {
    // fallback
  }
  return (crowdLevelsRaw as Record<string, { current: number; updatedAt: string; hourly: number[] }>)[
    siteId
  ];
}

export async function getGuides(): Promise<Guide[]> {
  try {
    const res = await api.guides.verify();
    if (res?.guides && res.guides.length > 0) {
      return res.guides.map((g) => ({
        id: g.id,
        name: g.name,
        asiId: g.licenseId,
        verified: g.licenseStatus === "VERIFIED",
        photo: g.photoUrl,
        experienceYears: g.experienceYears,
        languages: g.languages,
        specialty: "Cultural Heritage & Architecture",
        region: "Northern & Southern India",
        rateInr: g.ratePerHourINR,
        rating: 4.9,
      }));
    }
  } catch {
    // fallback
  }
  return fallbackGuides;
}

export async function searchGuides(query: string): Promise<Guide[]> {
  try {
    const res = await api.guides.verify(query);
    if (res?.guide) {
      const g = res.guide;
      return [
        {
          id: g.id,
          name: g.name,
          asiId: g.licenseId,
          verified: g.licenseStatus === "VERIFIED",
          photo: g.photoUrl,
          experienceYears: g.experienceYears,
          languages: g.languages,
          specialty: "Cultural Heritage & Architecture",
          region: "India",
          rateInr: g.ratePerHourINR,
          rating: 4.9,
        },
      ];
    }
  } catch {
    // fallback
  }
  const q = query.trim().toLowerCase();
  if (!q) return fallbackGuides;
  return fallbackGuides.filter(
    (g) => g.name.toLowerCase().includes(q) || (g.asiId ?? "").toLowerCase().includes(q)
  );
}

export async function getPricing(): Promise<PricingData> {
  try {
    const res = await api.pricing.get();
    if (res?.sites && res.sites.length > 0) {
      // Map live pricing
      return {
        ...(pricingRaw as PricingData),
        entryFees: res.sites.map((s) => ({
          siteId: s.id,
          siteName: s.name,
          indianInr: s.entryFeeINR,
          foreignInr: s.entryFeeINR > 0 ? s.entryFeeINR * 2 : 0,
        })),
      };
    }
  } catch {
    // fallback
  }
  return pricingRaw as PricingData;
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const res = await api.me.bookings();
    if (res && res.length > 0) {
      return res.map((b) => ({
        id: b.id,
        type: b.guide ? "guide" : "site",
        siteName: b.site.name,
        region: b.site.city,
        guideName: b.guide ? b.guide.name : null,
        date: b.visitDate,
        status: b.status.toLowerCase() as "upcoming" | "completed" | "cancelled",
        priceInr: b.totalINR,
        image: b.site.images[0] || fallbackSites[0].image,
      }));
    }
  } catch {
    // fallback
  }
  return fallbackBookings;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await api.me.notifications();
    if (res && res.length > 0) {
      return res.map((n) => ({
        id: n.id,
        type:
          n.type === "BOOKING"
            ? "booking"
            : n.type === "CROWD_ALERT"
            ? "crowd-alert"
            : "guide-verification",
        variant: n.title.toLowerCase().includes("cancel") ? "cancelled" : "confirmed",
        site: n.title,
        date: n.createdAt,
        read: Boolean(n.readAt),
      }));
    }
  } catch {
    // fallback
  }
  return fallbackNotifications;
}
