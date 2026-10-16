import { Router } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { siteId, guideId, partySize } = req.query;
    const size = Math.max(1, parseInt((partySize as string) || "1", 10));

    if (!siteId) {
      // General pricing catalog
      const [sites, guides] = await Promise.all([
        prisma.site.findMany({
          select: { id: true, slug: true, name: true, city: true, entryFeeINR: true },
          orderBy: { name: "asc" },
        }),
        prisma.guide.findMany({
          where: { licenseStatus: "VERIFIED" },
          select: { id: true, name: true, ratePerHourINR: true, standardRateINR: true },
          take: 6,
        }),
      ]);

      return res.json({
        data: {
          sites,
          standardGuideRateINR: 500,
          serviceFeePercent: 10,
          sampleGuides: guides,
        },
        error: null,
      });
    }

    const site = await prisma.site.findUnique({ where: { id: siteId as string } });
    if (!site) throw new AppError(404, "Site not found", "NOT_FOUND");

    let guide = null;
    if (guideId) {
      guide = await prisma.guide.findUnique({ where: { id: guideId as string } });
    }

    const siteEntryFee = site.entryFeeINR * size;
    const guideFee = guide ? guide.ratePerHourINR * 3 : 0; // Standard 3-hour tour
    const subtotal = siteEntryFee + guideFee;
    const serviceFee = Math.round(subtotal * 0.1); // 10% platform / safety concierge fee
    const taxes = Math.round(subtotal * 0.05); // 5% GST
    const totalINR = subtotal + serviceFee + taxes;

    const lineItems = [
      { label: `Site Entry (${size} ticket${size > 1 ? "s" : ""})`, amountINR: siteEntryFee },
      ...(guide ? [{ label: `Certified Guide Fee (${guide.name}, 3 hrs)`, amountINR: guideFee }] : []),
      { label: "Concierge & Platform Fee", amountINR: serviceFee },
      { label: "Applicable Taxes (GST 5%)", amountINR: taxes },
    ];

    return res.json({
      data: {
        siteId: site.id,
        siteName: site.name,
        partySize: size,
        guide: guide ? { id: guide.id, name: guide.name, ratePerHourINR: guide.ratePerHourINR } : null,
        lineItems,
        totalINR,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
