import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";

const router = Router();

const createBookingSchema = z.object({
  siteId: z.string().min(1),
  guideId: z.string().optional().nullable(),
  guideName: z.string().optional().nullable(),
  guideLicense: z.string().optional().nullable(),
  visitDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  visitSlot: z.string().optional(),
  time: z.string().optional(),
  partySize: z.number().int().min(1).default(1),
  userId: z.string().optional(),
});

function generateReference(siteSlug: string): string {
  const prefix = siteSlug.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HI-${year}-${prefix}-${rand}`;
}

router.post("/", optionalAuth, async (req, res, next) => {
  try {
    const { siteId, guideId, guideName, guideLicense, visitDate, visitSlot, time, partySize, userId: bodyUserId } = createBookingSchema.parse(req.body);

    const effectiveUserId = req.user?.id || bodyUserId;
    if (!effectiveUserId) {
      throw new AppError(401, "User ID or authentication required to create booking", "AUTH_REQUIRED");
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new AppError(404, "Site not found", "NOT_FOUND");

    let guide = null;
    const isSelf =
      !guideId ||
      guideId === "none" ||
      guideId === "self" ||
      guideId.toLowerCase().includes("none") ||
      guideId.toLowerCase().includes("self");

    if (!isSelf) {
      const candidates: Array<{ id?: string; licenseId?: string; name?: { contains: string } }> = [];
      if (guideId) {
        candidates.push({ id: guideId });
        candidates.push({ licenseId: guideId });
        candidates.push({ name: { contains: guideId } });
      }
      if (guideLicense) {
        candidates.push({ licenseId: guideLicense });
      }
      if (guideName && !guideName.toLowerCase().includes("self") && !guideName.toLowerCase().includes("none")) {
        candidates.push({ name: { contains: guideName } });
        const firstName = guideName.trim().split(/\s+/)[0];
        if (firstName && firstName.length >= 3) {
          candidates.push({ name: { contains: firstName } });
        }
      }

      if (candidates.length > 0) {
        guide = await prisma.guide.findFirst({
          where: { OR: candidates },
        });
      }
    }

    const siteEntryFee = site.entryFeeINR * partySize;
    const guideFee = guide ? guide.ratePerHourINR * 3 : 0;
    const subtotal = siteEntryFee + guideFee;
    const serviceFee = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const totalINR = subtotal + serviceFee + taxes;

    const reference = generateReference(site.slug);
    const dateObj = new Date(visitDate);
    const slotText = visitSlot || time || "09:00 AM (Morning Slot)";

    const booking = await prisma.booking.create({
      data: {
        userId: effectiveUserId,
        siteId: site.id,
        guideId: guide?.id ?? null,
        visitDate: dateObj,
        partySize,
        status: "UPCOMING",
        totalINR,
        reference,
        lineItems: {
          create: [
            { label: `Site Entry (${partySize} ticket${partySize > 1 ? "s" : ""})`, amountINR: siteEntryFee },
            ...(guide ? [{ label: `Certified Guide (${guide.name})`, amountINR: guideFee }] : []),
            { label: "Platform & Concierge Fee", amountINR: serviceFee },
            { label: "Taxes (GST 5%)", amountINR: taxes },
          ],
        },
      },
      include: {
        site: true,
        guide: true,
        lineItems: true,
      },
    });

    const dateFormatted = dateObj.toISOString().split("T")[0];
    await prisma.notification.create({
      data: {
        userId: effectiveUserId,
        type: "BOOKING",
        title: `Booking Confirmed: ${site.name}`,
        body: `Ticket booked for ${partySize} member${partySize > 1 ? "s" : ""} for ${site.name} at ${slotText} on ${dateFormatted} (Ref: ${reference}) with ${guide ? guide.name : "Self-Guided"}.`,
      },
    }).catch(() => {});

    return res.status(201).json({
      data: {
        id: booking.id,
        reference: booking.reference,
        visitDate: booking.visitDate,
        partySize: booking.partySize,
        totalINR: booking.totalINR,
        status: booking.status,
        site: {
          id: booking.site.id,
          name: booking.site.name,
          city: booking.site.city,
        },
        guide: booking.guide ? { id: booking.guide.id, name: booking.guide.name } : null,
        lineItems: booking.lineItems,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:reference", async (req, res, next) => {
  try {
    const { reference } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: {
        site: true,
        guide: true,
        payment: true,
        lineItems: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found", "NOT_FOUND");
    }

    return res.json({
      data: {
        id: booking.id,
        reference: booking.reference,
        visitDate: booking.visitDate,
        partySize: booking.partySize,
        status: booking.status,
        totalINR: booking.totalINR,
        createdAt: booking.createdAt,
        site: {
          id: booking.site.id,
          slug: booking.site.slug,
          name: booking.site.name,
          city: booking.site.city,
          state: booking.site.state,
          images: JSON.parse(booking.site.imageUrls || "[]"),
        },
        guide: booking.guide
          ? {
              id: booking.guide.id,
              name: booking.guide.name,
              licenseId: booking.guide.licenseId,
              licenseStatus: booking.guide.licenseStatus,
            }
          : null,
        payment: booking.payment,
        lineItems: booking.lineItems,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
