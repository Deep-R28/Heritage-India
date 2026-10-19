import { Router } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { getLiveCrowd, getHourlyForecast } from "../services/crowd.js";

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
          zone: (s as any).zone ?? "Northern",
          type: (s as any).type ?? s.category,
          established: (s as any).established ?? null,
          bestTime: (s as any).bestTime ?? null,
          weeklyOff: (s as any).weeklyOff ?? "Open All Days",
          googleRating: (s as any).googleRating ?? 4.0,
          reviewCount: (s as any).reviewCount ?? 0.5,
          significance: (s as any).significance ?? null,
          timeNeeded: (s as any).timeNeeded ?? 2.0,
          dslrAllowed: (s as any).dslrAllowed ?? true,
          airportNearby: (s as any).airportNearby ?? false,
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
    const normalizedSlug = slug.trim().toLowerCase().replace(/[\s_]+/g, "-");
    const nameVariant = slug.trim().replace(/[-_]+/g, " ");

    let site = await prisma.site.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: normalizedSlug },
          { name: { equals: slug } },
          { name: { equals: nameVariant } },
        ],
      },
      include: {
        content: true,
      },
    });

    if (!site) {
      const allSites = await prisma.site.findMany({ include: { content: true } });
      const target = normalizedSlug.replace(/[-_]+/g, " ").toLowerCase();
      site =
        allSites.find((s) => {
          const sSlugClean = s.slug.toLowerCase().replace(/[-_]+/g, " ");
          const sName = s.name.toLowerCase();
          return (
            sSlugClean === target ||
            sName === target ||
            target.includes(sSlugClean) ||
            sSlugClean.includes(target) ||
            target.includes(sName) ||
            sName.includes(target) ||
            (target.includes("hampi") && sSlugClean.includes("hampi")) ||
            (target.includes("bangalore") && sSlugClean.includes("bangalore")) ||
            (target.includes("unity") && sSlugClean.includes("unity")) ||
            (target.includes("taj") && sSlugClean.includes("taj"))
          );
        }) || null;
    }

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
        zone: (site as any).zone ?? "Northern",
        type: (site as any).type ?? site.category,
        established: (site as any).established ?? null,
        bestTime: (site as any).bestTime ?? null,
        weeklyOff: (site as any).weeklyOff ?? "Open All Days",
        googleRating: (site as any).googleRating ?? 4.0,
        reviewCount: (site as any).reviewCount ?? 0.5,
        significance: (site as any).significance ?? null,
        timeNeeded: (site as any).timeNeeded ?? 2.0,
        dslrAllowed: (site as any).dslrAllowed ?? true,
        airportNearby: (site as any).airportNearby ?? false,
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

// ─── Hourly Forecast: GET /api/sites/:slug/forecast ─────────────

router.get("/:slug/forecast", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const site = await prisma.site.findUnique({ where: { slug }, select: { id: true, slug: true, name: true } });
    if (!site) throw new AppError(404, "Site not found", "NOT_FOUND");

    const crowd = await getLiveCrowd(site.id, site.slug);
    const forecast = await getHourlyForecast(site.slug);

    return res.json({
      data: {
        site: { id: site.id, slug: site.slug, name: site.name },
        current: crowd,
        hourly: forecast,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
