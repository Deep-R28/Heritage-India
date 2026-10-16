import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/verify", async (req, res, next) => {
  try {
    const q = ((req.query.q as string) || "").trim();

    if (!q) {
      // Return list of guides
      const allGuides = await prisma.guide.findMany({
        orderBy: { experienceYears: "desc" },
      });
      return res.json({
        data: {
          status: "list",
          guides: allGuides.map((g) => ({
            id: g.id,
            name: g.name,
            licenseId: g.licenseId,
            licenseStatus: g.licenseStatus,
            experienceYears: g.experienceYears,
            languages: JSON.parse(g.languages || "[]"),
            ratePerHourINR: g.ratePerHourINR,
            standardRateINR: g.standardRateINR,
            photoUrl: g.photoUrl,
          })),
        },
        error: null,
      });
    }

    // Search by exact licenseId or partial name
    const exactLicense = await prisma.guide.findFirst({
      where: { licenseId: { equals: q } },
    });

    const match =
      exactLicense ||
      (await prisma.guide.findFirst({
        where: {
          OR: [
            { licenseId: { contains: q } },
            { name: { contains: q } },
          ],
        },
      }));

    if (!match) {
      return res.json({
        data: {
          status: "not_found",
          guide: null,
        },
        error: null,
      });
    }

    return res.json({
      data: {
        status: match.licenseStatus === "VERIFIED" ? "verified" : "unverified",
        guide: {
          id: match.id,
          name: match.name,
          licenseId: match.licenseId,
          licenseStatus: match.licenseStatus,
          experienceYears: match.experienceYears,
          languages: JSON.parse(match.languages || "[]"),
          ratePerHourINR: match.ratePerHourINR,
          standardRateINR: match.standardRateINR,
          photoUrl: match.photoUrl,
        },
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
