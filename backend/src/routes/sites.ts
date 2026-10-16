import { Router } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { getLiveCrowd } from "../services/crowd.js";

const router = Router();

// Haversine formula for distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─── Explore: GET /api/sites ────────────────────────────────────

router.get("/", async (req, res, next) => {
  try {
    const { lat, lng, radius, category, crowd, q, sort } = req.query;

    const where: any = {};
    if (category && category !== "all" && category !== "All") {
      where.category = { equals: category as string };
    }
    if (q) {
      where.OR = [
        { name: { contains: q as string } },
        { city: { contains: q as string } },
        { state: { contains: q as string } },
      ];
    }

    const sites = await prisma.site.findMany({ where });

    // Enrich with live crowd info and distance
    const userLat = lat ? parseFloat(lat as string) : undefined;
    const userLng = lng ? parseFloat(lng as string) : undefined;
    const maxRadius = radius ? parseFloat(radius as string) : undefined;

    let enriched = await Promise.all(
      sites.map(async (s) => {
        const crowdInfo = await getLiveCrowd(s.id, s.slug);
        const distanceKm =
          userLat !== undefined && userLng !== undefined
            ? calculateDistanceKm(userLat, userLng, s.lat, s.lng)
            : undefined;

        return {
          id: s.id,
          slug: s.slug,
          name: s.name,
          city: s.city,
          state: s.state,
          category: s.category,
          lat: s.lat,
          lng: s.lng,
          distanceKm,
          entryFeeINR: s.entryFeeINR,
          openingHours: s.openingHours,
          images: JSON.parse(s.imageUrls || "[]"),
          crowd: crowdInfo,
        };
      })
    );

    // Filter by radius if provided
    if (maxRadius !== undefined) {
      enriched = enriched.filter((s) => s.distanceKm === undefined || s.distanceKm <= maxRadius);
    }

    // Filter by crowd level if requested
    if (crowd && crowd !== "all" && crowd !== "All") {
      enriched = enriched.filter(
        (s) => s.crowd.level.toLowerCase() === (crowd as string).toLowerCase()
      );
    }

    // Sorting
    if (sort === "crowd_asc") {
      enriched.sort((a, b) => a.crowd.percent - b.crowd.percent);
    } else if (sort === "crowd_desc") {
      enriched.sort((a, b) => b.crowd.percent - a.crowd.percent);
    } else if (sort === "price_asc") {
      enriched.sort((a, b) => a.entryFeeINR - b.entryFeeINR);
    } else if (sort === "price_desc") {
      enriched.sort((a, b) => b.entryFeeINR - a.entryFeeINR);
    } else if (sort === "distance_asc" && userLat !== undefined) {
      enriched.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    }

    return res.json({ data: enriched, error: null });
  } catch (err) {
    next(err);
  }
});

// ─── Map Selector: GET /api/sites/map ───────────────────────────

router.get("/map", async (req, res, next) => {
  try {
    const { bbox } = req.query; // minLng,minLat,maxLng,maxLat
    let sites = await prisma.site.findMany();

    if (typeof bbox === "string") {
      const parts = bbox.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        sites = sites.filter(
          (s) => s.lng >= minLng && s.lng <= maxLng && s.lat >= minLat && s.lat <= maxLat
        );
      }
    }

    const pins = await Promise.all(
      sites.map(async (s) => {
        const crowd = await getLiveCrowd(s.id, s.slug);
        const images = JSON.parse(s.imageUrls || "[]");
        return {
          id: s.id,
          slug: s.slug,
          name: s.name,
          city: s.city,
          state: s.state,
          category: s.category,
          lat: s.lat,
          lng: s.lng,
          entryFeeINR: s.entryFeeINR,
          thumbnail: images[0] || null,
          crowd,
        };
      })
    );

    return res.json({ data: pins, error: null });
  } catch (err) {
    next(err);
  }
});

// ─── Site Detail: GET /api/sites/:slug ──────────────────────────

router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const locale = (req.query.locale as string) || "en";

    const site = await prisma.site.findUnique({
      where: { slug },
      include: {
        content: true,
      },
    });

    if (!site) {
      throw new AppError(404, "Site not found", "NOT_FOUND");
    }

    const crowd = await getLiveCrowd(site.id, site.slug);
    const contentForLocale =
      site.content.find((c) => c.locale === locale) ||
      site.content.find((c) => c.locale === "en") ||
      site.content[0];

    const images = JSON.parse(site.imageUrls || "[]");

    return res.json({
      data: {
        id: site.id,
        slug: site.slug,
        name: site.name,
        city: site.city,
        state: site.state,
        category: site.category,
        lat: site.lat,
        lng: site.lng,
        entryFeeINR: site.entryFeeINR,
        openingHours: site.openingHours,
        images,
        crowd,
        content: contentForLocale
          ? {
              locale: contentForLocale.locale,
              history: contentForLocale.history,
              significance: contentForLocale.significance,
              tips: contentForLocale.tips,
            }
          : null,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Smart Alternatives: GET /api/sites/:slug/alternatives ──────

router.get("/:slug/alternatives", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const targetSite = await prisma.site.findUnique({ where: { slug } });
    if (!targetSite) throw new AppError(404, "Site not found", "NOT_FOUND");

    const targetCrowd = await getLiveCrowd(targetSite.id, targetSite.slug);
    const allSites = await prisma.site.findMany({ where: { id: { not: targetSite.id } } });

    // Enrich all other sites with distance and crowd
    const candidates = await Promise.all(
      allSites.map(async (s) => {
        const crowd = await getLiveCrowd(s.id, s.slug);
        const distanceKm = calculateDistanceKm(targetSite.lat, targetSite.lng, s.lat, s.lng);
        return {
          id: s.id,
          slug: s.slug,
          name: s.name,
          city: s.city,
          state: s.state,
          category: s.category,
          entryFeeINR: s.entryFeeINR,
          images: JSON.parse(s.imageUrls || "[]"),
          distanceDeltaKm: distanceKm,
          crowd,
        };
      })
    );

    // Rank: first prioritize sites with lower crowd than target, then by shortest distance
    const quieter = candidates.filter((c) => c.crowd.percent < targetCrowd.percent);
    const ranked = (quieter.length > 0 ? quieter : candidates).sort((a, b) => {
      // Prioritize crowd difference first, then distance
      const crowdDiff = a.crowd.percent - b.crowd.percent;
      if (Math.abs(crowdDiff) > 15) return crowdDiff;
      return a.distanceDeltaKm - b.distanceDeltaKm;
    });

    return res.json({
      data: {
        target: {
          id: targetSite.id,
          slug: targetSite.slug,
          name: targetSite.name,
          crowd: targetCrowd,
        },
        alternatives: ranked.slice(0, 4),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Crowd Meter: GET /api/sites/:slug/crowd ────────────────────

router.get("/:slug/crowd", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const site = await prisma.site.findUnique({ where: { slug }, select: { id: true, slug: true } });
    if (!site) throw new AppError(404, "Site not found", "NOT_FOUND");

    const crowd = await getLiveCrowd(site.id, site.slug);
    return res.json({ data: crowd, error: null });
  } catch (err) {
    next(err);
  }
});

export default router;
