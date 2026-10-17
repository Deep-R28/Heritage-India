import prisma from "../lib/prisma.js";
import { notifyCrowdShift } from "./notification.js";

export interface CrowdInfo {
  level: "LOW" | "MEDIUM" | "HIGH";
  percent: number;
  lastUpdated: string;
  source?: "data" | "simulated";
}

export interface HourlyForecast {
  hour: number;
  expectedPercent: number;
  level: "LOW" | "MEDIUM" | "HIGH";
}

// ─── Data-Driven Crowd Prediction ───────────────────────────────
// Uses CrowdPattern table seeded from the India Crowd Flow Dataset.
// Falls back to simulation when no pattern data exists for a site.

/**
 * Get the predicted crowd density for a site at a given date/time
 * using stored CrowdPattern records.
 */
async function getDataDrivenDensity(
  slug: string,
  date = new Date()
): Promise<{ density: number; found: boolean }> {
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  const hour = date.getHours();
  // Round hour to nearest pattern hour (6, 8, 10, 12, 14, 16, 18, 20)
  const patternHours = [6, 8, 10, 12, 14, 16, 18, 20];
  const closestHour = patternHours.reduce((prev, curr) =>
    Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev
  );

  // Check if today is a known Indian holiday (major ones)
  const isHoliday = checkIsHoliday(date);

  // Query pattern data
  const pattern = await prisma.crowdPattern.findFirst({
    where: {
      siteSlug: slug,
      dayOfWeek,
      hour: closestHour,
      isHoliday,
    },
  }).catch(() => null);

  if (pattern) {
    // Apply minor real-time variation (±5%) based on minute
    const minuteVariation = Math.sin((date.getMinutes() * Math.PI) / 30) * 0.05;
    const adjustedDensity = Math.max(0.05, Math.min(0.98, pattern.avgDensity + minuteVariation));
    return { density: adjustedDensity, found: true };
  }

  // Try without the holiday flag
  const fallbackPattern = await prisma.crowdPattern.findFirst({
    where: {
      siteSlug: slug,
      dayOfWeek,
      hour: closestHour,
      isHoliday: false,
    },
  }).catch(() => null);

  if (fallbackPattern) {
    const holidayMultiplier = isHoliday ? 1.4 : 1.0;
    const adjusted = Math.min(0.98, fallbackPattern.avgDensity * holidayMultiplier);
    return { density: adjusted, found: true };
  }

  return { density: 0, found: false };
}

/**
 * Check if a date falls on a major Indian holiday.
 * These dates recur annually or are well-known national holidays.
 */
function checkIsHoliday(date: Date): boolean {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Fixed holidays (month is 0-indexed)
  const fixedHolidays: [number, number][] = [
    [0, 1],   // New Year
    [0, 26],  // Republic Day
    [7, 15],  // Independence Day
    [9, 2],   // Gandhi Jayanti
    [11, 25], // Christmas
  ];

  for (const [m, d] of fixedHolidays) {
    if (month === m && day === d) return true;
  }

  // Weekends count as semi-holidays for crowd purposes
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // handled via dayOfWeek patterns

  return false;
}

// ─── Simulation Fallback ────────────────────────────────────────
// Used when no CrowdPattern data exists for a site.

export function calculateCrowdSimulation(
  slug: string,
  date = new Date()
): { level: "LOW" | "MEDIUM" | "HIGH"; percent: number } {
  const hour = date.getHours();
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  let basePercent: number;
  if (hour < 6) {
    basePercent = 5;
  } else if (hour < 9) {
    basePercent = 20 + (hour - 6) * 10;
  } else if (hour < 12) {
    basePercent = 50 + (hour - 9) * 10;
  } else if (hour < 15) {
    basePercent = 75 + Math.sin(hour) * 10;
  } else if (hour < 18) {
    basePercent = 60 - (hour - 15) * 8;
  } else if (hour < 21) {
    basePercent = 30 - (hour - 18) * 7;
  } else {
    basePercent = 5;
  }

  const popMultiplier = POPULARITY_WEIGHTS[slug] ?? 1.0;
  const weekendMultiplier = isWeekend ? 1.25 : 1.0;
  const minuteVariation = Math.sin((date.getMinutes() * Math.PI) / 30) * 6;

  let calculated = Math.round(basePercent * popMultiplier * weekendMultiplier + minuteVariation);
  calculated = Math.max(8, Math.min(96, calculated));

  let level: "LOW" | "MEDIUM" | "HIGH";
  if (calculated < 40) {
    level = "LOW";
  } else if (calculated < 75) {
    level = "MEDIUM";
  } else {
    level = "HIGH";
  }

  return { level, percent: calculated };
}

// Popularity weights for simulation fallback (original 15 sites + some new ones)
const POPULARITY_WEIGHTS: Record<string, number> = {
  "taj-mahal": 1.4,
  "golden-temple": 1.35,
  "ram-mandir": 1.35,
  "mysore-palace": 1.3,
  "red-fort": 1.25,
  "amber-fort": 1.2,
  "qutub-minar": 1.15,
  "charminar": 1.1,
  "hawa-mahal": 1.1,
  "tirupati-balaji": 1.1,
  "varanasi-ghats": 1.1,
  "gateway-of-india": 1.05,
  "meenakshi-temple": 1.05,
  "victoria-memorial": 1.0,
  "agra-fort": 1.0,
  "humayuns-tomb": 0.95,
  "hampi": 0.9,
  "statue-of-unity": 0.9,
  "fatehpur-sikri": 0.85,
  "golconda-fort": 0.85,
  "konark-sun-temple": 0.8,
  "mahabalipuram": 0.8,
  "khajuraho": 0.75,
  "ellora-caves": 0.75,
  "ajanta-caves": 0.7,
  "sanchi-stupa": 0.65,
  "kaziranga": 0.6,
  "sundarbans": 0.55,
  "living-root-bridges": 0.5,
  "tawang-monastery": 0.45,
  "mandu": 0.4,
};

// ─── Unified Crowd Getter ───────────────────────────────────────
// Prefers data-driven patterns, falls back to simulation.

export async function getLiveCrowd(siteId: string, slug: string): Promise<CrowdInfo> {
  // Check the most recent snapshot in the last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const latestSnapshot = await prisma.crowdSnapshot.findFirst({
    where: {
      siteId,
      recordedAt: { gte: fifteenMinutesAgo },
    },
    orderBy: { recordedAt: "desc" },
  });

  if (latestSnapshot) {
    return {
      level: latestSnapshot.level as "LOW" | "MEDIUM" | "HIGH",
      percent: latestSnapshot.percent,
      lastUpdated: latestSnapshot.recordedAt.toISOString(),
      source: "data",
    };
  }

  // Prior snapshot for shift detection
  const previousSnapshot = await prisma.crowdSnapshot.findFirst({
    where: { siteId },
    orderBy: { recordedAt: "desc" },
  });

  // Try data-driven prediction first
  const { density, found } = await getDataDrivenDensity(slug);

  let level: "LOW" | "MEDIUM" | "HIGH";
  let percent: number;
  let source: "data" | "simulated";

  if (found) {
    percent = Math.round(density * 100);
    percent = Math.max(5, Math.min(98, percent));
    level = percent < 40 ? "LOW" : percent < 75 ? "MEDIUM" : "HIGH";
    source = "data";
  } else {
    // Fallback to simulation
    const sim = calculateCrowdSimulation(slug);
    level = sim.level;
    percent = sim.percent;
    source = "simulated";
  }

  // Save new snapshot
  const newSnapshot = await prisma.crowdSnapshot.create({
    data: { siteId, level, percent },
  });

  // Check if level shifted into HIGH or dropped to LOW to notify saved site users
  if (previousSnapshot && previousSnapshot.level !== level) {
    if (level === "HIGH" || level === "LOW") {
      notifyCrowdShift(siteId, level, percent).catch((err) =>
        console.error("Failed to notify crowd shift:", err)
      );
    }
  }

  return {
    level,
    percent,
    lastUpdated: newSnapshot.recordedAt.toISOString(),
    source,
  };
}

// ─── Hourly Forecast ────────────────────────────────────────────
// Returns predicted crowd for each hour of the current day.

export async function getHourlyForecast(slug: string, date = new Date()): Promise<HourlyForecast[]> {
  const dayOfWeek = date.getDay();
  const isHoliday = checkIsHoliday(date);

  // Try to get all patterns for this site & day
  const patterns = await prisma.crowdPattern.findMany({
    where: {
      siteSlug: slug,
      dayOfWeek,
      isHoliday,
    },
    orderBy: { hour: "asc" },
  }).catch(() => [] as any[]);

  if (patterns.length > 0) {
    return patterns.map((p: any) => {
      const pct = Math.round(p.avgDensity * 100);
      return {
        hour: p.hour,
        expectedPercent: Math.max(5, Math.min(98, pct)),
        level: pct < 40 ? "LOW" as const : pct < 75 ? "MEDIUM" as const : "HIGH" as const,
      };
    });
  }

  // Fallback: generate from simulation
  const hours = [6, 8, 10, 12, 14, 16, 18, 20];
  return hours.map((h) => {
    const fakeDate = new Date(date);
    fakeDate.setHours(h, 0, 0, 0);
    const sim = calculateCrowdSimulation(slug, fakeDate);
    return {
      hour: h,
      expectedPercent: sim.percent,
      level: sim.level,
    };
  });
}
