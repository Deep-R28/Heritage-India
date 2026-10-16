import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { getLiveCrowd } from "../services/crowd.js";
import { createCancellationNotification } from "../services/notification.js";

const router = Router();
router.use(requireAuth);

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  visionMode: z.enum(["default", "protanopia", "deuteranopia", "tritanopia"]).optional(),
  language: z.enum(["en", "hi", "es"]).optional(),
  onboardingDone: z.boolean().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// ─── Preferences ────────────────────────────────────────────────

router.put("/preferences", async (req, res, next) => {
  try {
    const data = preferencesSchema.parse(req.body);
    const pref = await prisma.preference.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: {
        userId: req.user!.id,
        theme: data.theme ?? "dark",
        visionMode: data.visionMode ?? "default",
        language: data.language ?? "en",
        onboardingDone: data.onboardingDone ?? false,
      },
    });

    return res.json({ data: pref, error: null });
  } catch (err) {
    next(err);
  }
});

// ─── Profile ────────────────────────────────────────────────────

router.get("/profile", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        preference: true,
      },
    });
    return res.json({ data: user, error: null });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", async (req, res, next) => {
  try {
    const { name, avatarUrl } = profileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    return res.json({ data: updated, error: null });
  } catch (err) {
    next(err);
  }
});

router.put("/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, "User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError(400, "Current password incorrect", "INVALID_PASSWORD");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash },
    });

    return res.json({ data: { success: true }, error: null });
  } catch (err) {
    next(err);
  }
});

// ─── Dashboard ──────────────────────────────────────────────────

router.get("/dashboard", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [bookings, savedCount, pref] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        include: { site: true, guide: true },
        orderBy: { visitDate: "asc" },
      }),
      prisma.savedSite.count({ where: { userId } }),
      prisma.preference.findUnique({ where: { userId } }),
    ]);

    const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
    const upcomingBookings = bookings.filter((b) => b.status === "UPCOMING");

    const sitesVisited = new Set(completedBookings.map((b) => b.siteId)).size;
    const guidesBooked = new Set(bookings.filter((b) => b.guideId).map((b) => b.guideId)).size;

    return res.json({
      data: {
        stats: {
          sitesVisited,
          guidesBooked,
          savedSites: savedCount,
          languagesUsed: pref?.language ? [pref.language] : ["en"],
        },
        upcomingBookings: upcomingBookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          site: {
            id: b.site.id,
            slug: b.site.slug,
            name: b.site.name,
            city: b.site.city,
            images: JSON.parse(b.site.imageUrls || "[]"),
          },
          guide: b.guide
            ? {
                id: b.guide.id,
                name: b.guide.name,
                licenseStatus: b.guide.licenseStatus,
              }
            : null,
          visitDate: b.visitDate,
          partySize: b.partySize,
          totalINR: b.totalINR,
          status: b.status,
        })),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ─── My Trips / Bookings ────────────────────────────────────────

router.get("/bookings", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string | undefined;
    const q = req.query.q as string | undefined;

    const where: any = { userId };
    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }
    if (q) {
      where.OR = [
        { reference: { contains: q } },
        { site: { name: { contains: q } } },
        { guide: { name: { contains: q } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        site: true,
        guide: true,
        payment: true,
        lineItems: true,
      },
      orderBy: { visitDate: "desc" },
    });

    return res.json({
      data: bookings.map((b) => ({
        id: b.id,
        reference: b.reference,
        visitDate: b.visitDate,
        partySize: b.partySize,
        status: b.status,
        totalINR: b.totalINR,
        createdAt: b.createdAt,
        site: {
          id: b.site.id,
          slug: b.site.slug,
          name: b.site.name,
          city: b.site.city,
          state: b.site.state,
          images: JSON.parse(b.site.imageUrls || "[]"),
        },
        guide: b.guide
          ? {
              id: b.guide.id,
              name: b.guide.name,
              licenseId: b.guide.licenseId,
              licenseStatus: b.guide.licenseStatus,
            }
          : null,
        payment: b.payment,
        lineItems: b.lineItems,
      })),
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/bookings/:id/cancel", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { site: true },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found", "NOT_FOUND");
    }

    if (booking.status === "CANCELLED") {
      throw new AppError(400, "Booking is already cancelled", "ALREADY_CANCELLED");
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    await createCancellationNotification(req.user!.id, booking.reference, booking.site.name);

    return res.json({
      data: updated,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Notifications ──────────────────────────────────────────────

router.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      data: notifications,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!notif) {
      throw new AppError(404, "Notification not found", "NOT_FOUND");
    }

    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { readAt: new Date() },
    });

    return res.json({ data: updated, error: null });
  } catch (err) {
    next(err);
  }
});

router.patch("/notifications/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });

    return res.json({ data: { success: true }, error: null });
  } catch (err) {
    next(err);
  }
});

// ─── Saved Sites ────────────────────────────────────────────────

router.get("/saved", async (req, res, next) => {
  try {
    const saved = await prisma.savedSite.findMany({
      where: { userId: req.user!.id },
      include: { site: true },
    });

    const enriched = await Promise.all(
      saved.map(async (s) => {
        const crowd = await getLiveCrowd(s.site.id, s.site.slug);
        return {
          id: s.site.id,
          slug: s.site.slug,
          name: s.site.name,
          city: s.site.city,
          state: s.site.state,
          category: s.site.category,
          entryFeeINR: s.site.entryFeeINR,
          images: JSON.parse(s.site.imageUrls || "[]"),
          crowd,
        };
      })
    );

    return res.json({ data: enriched, error: null });
  } catch (err) {
    next(err);
  }
});

router.post("/saved/:siteId", async (req, res, next) => {
  try {
    const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
    if (!site) throw new AppError(404, "Site not found", "NOT_FOUND");

    const saved = await prisma.savedSite.upsert({
      where: {
        userId_siteId: {
          userId: req.user!.id,
          siteId: site.id,
        },
      },
      create: {
        userId: req.user!.id,
        siteId: site.id,
      },
      update: {},
    });

    return res.status(201).json({ data: saved, error: null });
  } catch (err) {
    next(err);
  }
});

router.delete("/saved/:siteId", async (req, res, next) => {
  try {
    await prisma.savedSite.deleteMany({
      where: {
        userId: req.user!.id,
        siteId: req.params.siteId,
      },
    });

    return res.json({ data: { success: true }, error: null });
  } catch (err) {
    next(err);
  }
});

export default router;
