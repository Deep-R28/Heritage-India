import prisma from "../lib/prisma.js";
import { notifyCrowdShift } from "./notification.js";

export interface CrowdInfo {
  level: "LOW" | "MEDIUM" | "HIGH";
  percent: number;
  lastUpdated: string;
}

const POPULARITY_WEIGHTS: Record<string, number> = {
  "taj-mahal": 1.4,
  "mysore-palace": 1.3,
  "red-fort": 1.25,
  "amber-fort": 1.2,
  "qutub-minar": 1.15,
  "charminar": 1.1,
  "hawa-mahal": 1.1,
  "meenakshi-temple": 1.05,
  "hampi": 0.9,
  "fatehpur-sikri": 0.85,
  "golconda-fort": 0.85,
  "konark-sun-temple": 0.8,
  "khajuraho": 0.75,
  "ellora-caves": 0.75,
  "ajanta-caves": 0.7,
};

export function calculateCrowdSimulation(slug: string, date = new Date()): { level: "LOW" | "MEDIUM" | "HIGH"; percent: number } {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;

  // Base curve by hour of day (6:00 to 20:00)
  let basePercent: number;
  if (hour < 6) {
    basePercent = 5;
  } else if (hour < 9) {
    basePercent = 20 + (hour - 6) * 10; // 20 - 50%
  } else if (hour < 12) {
    basePercent = 50 + (hour - 9) * 10; // 50 - 80%
  } else if (hour < 15) {
    basePercent = 75 + Math.sin(hour) * 10; // Peak 70 - 85%
  } else if (hour < 18) {
    basePercent = 60 - (hour - 15) * 8; // 60 - 36%
  } else if (hour < 21) {
    basePercent = 30 - (hour - 18) * 7; // 30 - 9%
  } else {
    basePercent = 5;
  }

  // Multipliers
  const popMultiplier = POPULARITY_WEIGHTS[slug] ?? 1.0;
  const weekendMultiplier = isWeekend ? 1.25 : 1.0;
  
  // Seeded/deterministic minor variation using minute of the hour
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
    };
  }

  // Prior snapshot for shift detection
  const previousSnapshot = await prisma.crowdSnapshot.findFirst({
    where: { siteId },
    orderBy: { recordedAt: "desc" },
  });

  // Calculate new snapshot
  const { level, percent } = calculateCrowdSimulation(slug);
  const newSnapshot = await prisma.crowdSnapshot.create({
    data: {
      siteId,
      level,
      percent,
    },
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
  };
}
