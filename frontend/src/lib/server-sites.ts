import nearbySitesRaw from "@/data/nearby-sites.json";
import type { ApiSite } from "@/lib/api";

function calculateLiveCrowd(slug: string): { level: "LOW" | "MEDIUM" | "HIGH"; percent: number; lastUpdated: string } {
  const hour = new Date().getHours();
  // Deterministic calculation based on slug and hour
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const baseOffset = Math.abs(hash) % 20;

  let percent: number;
  if (hour < 8 || hour >= 19) {
    percent = Math.min(20, Math.max(5, 8 + (baseOffset % 8)));
  } else if (hour >= 11 && hour <= 15) {
    percent = Math.min(85, Math.max(30, 48 + (baseOffset % 35)));
  } else {
    percent = Math.min(45, Math.max(15, 22 + (baseOffset % 15)));
  }

  const level = percent > 65 ? "HIGH" : percent > 35 ? "MEDIUM" : "LOW";
  return {
    level,
    percent,
    lastUpdated: new Date().toISOString(),
  };
}

export function getAllApiSites(): ApiSite[] {
  return (nearbySitesRaw as Array<Record<string, unknown>>).map((s) => {
    const slug = String(s.slug || "");
    const parts = String(s.region || "").split(",");
    const city = parts[0]?.trim() || "India";
    const state = parts[1]?.trim() || "India";

    return {
      id: String(s.id || slug),
      slug,
      name: String(s.name || ""),
      city,
      state,
      category: String(s.category || "Monument"),
      lat: Number(s.lat || 27.1751),
      lng: Number(s.lng || 78.0421),
      entryFeeINR: Number(s.priceInr ?? 1100),
      openingHours: String(s.openHours || "6:00 AM – 6:30 PM"),
      images: Array.isArray(s.gallery) && s.gallery.length > 0 ? (s.gallery as string[]) : [String(s.image || "")],
      zone: String(s.zone || "Northern"),
      type: String(s.type || "Historical"),
      googleRating: Number(s.googleRating || 4.5),
      significance: String(s.summary || ""),
      crowd: calculateLiveCrowd(slug),
      content: {
        locale: "en",
        history: String(s.history || s.summary || ""),
        significance: String(s.summary || ""),
        tips: "Visit early morning for serene views and minimal queues.",
      },
    };
  });
}
