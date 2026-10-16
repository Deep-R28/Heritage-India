/**
 * Verification script — counts rows through Prisma Client
 * to confirm the database was seeded correctly.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log("═══════════════════════════════════════");
  console.log("  Heritage India — Database Verification");
  console.log("═══════════════════════════════════════\n");

  const sites = await prisma.site.count();
  const guides = await prisma.guide.count();
  const verifiedGuides = await prisma.guide.count({ where: { licenseStatus: "VERIFIED" } });
  const unverifiedGuides = await prisma.guide.count({ where: { licenseStatus: "UNVERIFIED" } });
  const siteContent = await prisma.siteContent.count();
  const users = await prisma.user.count();
  const bookings = await prisma.booking.count();
  const notifications = await prisma.notification.count();
  const savedSites = await prisma.savedSite.count();
  const crowdSnapshots = await prisma.crowdSnapshot.count();
  const payments = await prisma.payment.count();
  const lineItems = await prisma.lineItem.count();
  const preferences = await prisma.preference.count();

  // Check locale distribution
  const locales = await prisma.siteContent.groupBy({
    by: ["locale"],
    _count: { locale: true },
  });

  console.log(`Sites:           ${sites} ${sites >= 15 ? "✅" : "❌ (expected ≥ 15)"}`);
  console.log(`Guides:          ${guides} ${guides >= 12 ? "✅" : "❌ (expected ≥ 12)"}`);
  console.log(`  Verified:      ${verifiedGuides}`);
  console.log(`  Unverified:    ${unverifiedGuides}`);
  console.log(`Site Content:    ${siteContent}`);
  for (const l of locales) {
    console.log(`  ${l.locale}:           ${l._count.locale} entries`);
  }
  const localeCount = locales.length;
  console.log(`  Locales:       ${localeCount} ${localeCount >= 3 ? "✅" : "❌ (expected ≥ 3)"}`);
  console.log(`Users:           ${users}`);
  console.log(`Preferences:     ${preferences}`);
  console.log(`Bookings:        ${bookings}`);
  console.log(`Payments:        ${payments}`);
  console.log(`Line Items:      ${lineItems}`);
  console.log(`Saved Sites:     ${savedSites}`);
  console.log(`Notifications:   ${notifications}`);
  console.log(`Crowd Snapshots: ${crowdSnapshots}`);

  console.log("\n═══════════════════════════════════════");
  const allGood = sites >= 15 && guides >= 12 && localeCount >= 3;
  if (allGood) {
    console.log("  ✅ ALL CHECKS PASSED");
  } else {
    console.log("  ❌ SOME CHECKS FAILED");
  }
  console.log("═══════════════════════════════════════\n");

  return allGood;
}

verify()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((e) => {
    console.error("Verification error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
