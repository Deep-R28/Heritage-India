import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [siteCount, verifiedGuideCount] = await Promise.all([
      prisma.site.count(),
      prisma.guide.count({ where: { licenseStatus: "VERIFIED" } }),
    ]);

    return res.json({
      data: {
        siteCount,
        verifiedGuideCount,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
