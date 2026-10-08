/**
 * Mock data layer (Section 9). Every getter here is async so swapping the
 * body for a real `fetch()` later never touches call sites.
 */
import nearbySitesRaw from "@/data/nearby-sites.json";
import crowdLevelsRaw from "@/data/crowd-levels.json";
import guideRegistryRaw from "@/data/guide-registry.json";
import pricingRaw from "@/data/pricing.json";
import bookingsRaw from "@/data/bookings.json";
import notificationsRaw from "@/data/notifications.json";
import type { PricingData } from "@/components/pricing/pricing-types";

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
  /** For type "booking": which templated message to render. */
  variant?: "confirmed" | "cancelled";
  guide?: string;
  site?: string;
  percent?: number;
  /** ISO date referenced inside the message body (e.g. the booking date). */
  eventDate?: string;
  /** ISO date the notification itself was posted — used for the date-group heading. */
  date: string;
  read: boolean;
}

const nearbySites = nearbySitesRaw as Site[];
const guideRegistry = guideRegistryRaw as Guide[];
const bookings = bookingsRaw as Booking[];
const notifications = notificationsRaw as NotificationItem[];

export async function getSites(): Promise<Site[]> {
  return nearbySites;
}

export async function getSiteBySlug(slug: string): Promise<Site | undefined> {
  return nearbySites.find((s) => s.slug === slug);
}

export async function getAlternativesFor(siteId: string, count = 2): Promise<Site[]> {
  return nearbySites.filter((s) => s.id !== siteId && s.crowdPercent < 50).slice(0, count);
}

export async function getCrowdLevel(siteId: string) {
  return (crowdLevelsRaw as Record<string, { current: number; updatedAt: string; hourly: number[] }>)[
    siteId
  ];
}

export async function getGuides(): Promise<Guide[]> {
  return guideRegistry;
}

export async function searchGuides(query: string): Promise<Guide[]> {
  const q = query.trim().toLowerCase();
  if (!q) return guideRegistry;
  return guideRegistry.filter(
    (g) => g.name.toLowerCase().includes(q) || (g.asiId ?? "").toLowerCase().includes(q),
  );
}

export async function getPricing(): Promise<PricingData> {
  return pricingRaw as PricingData;
}

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return notifications;
}
