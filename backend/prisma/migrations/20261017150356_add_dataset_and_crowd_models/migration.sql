-- CreateTable
CREATE TABLE "CrowdPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteSlug" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "avgDensity" REAL NOT NULL,
    "weather" TEXT NOT NULL DEFAULT 'Clear',
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "season" TEXT NOT NULL DEFAULT 'peak'
);

-- CreateTable
CREATE TABLE "VisitorStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteSlug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "domesticVisitors" INTEGER NOT NULL,
    "foreignVisitors" INTEGER NOT NULL,
    "totalVisitors" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "imageUrls" TEXT NOT NULL,
    "entryFeeINR" INTEGER NOT NULL,
    "openingHours" TEXT NOT NULL,
    "baseCapacity" INTEGER NOT NULL DEFAULT 1000,
    "zone" TEXT NOT NULL DEFAULT 'Northern',
    "type" TEXT NOT NULL DEFAULT 'Historical',
    "established" TEXT,
    "bestTime" TEXT,
    "weeklyOff" TEXT NOT NULL DEFAULT 'Open All Days',
    "dslrAllowed" BOOLEAN NOT NULL DEFAULT true,
    "googleRating" REAL NOT NULL DEFAULT 4.0,
    "reviewCount" REAL NOT NULL DEFAULT 0.5,
    "significance" TEXT,
    "timeNeeded" REAL NOT NULL DEFAULT 2.0,
    "airportNearby" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Site" ("baseCapacity", "category", "city", "entryFeeINR", "id", "imageUrls", "lat", "lng", "name", "openingHours", "slug", "state") SELECT "baseCapacity", "category", "city", "entryFeeINR", "id", "imageUrls", "lat", "lng", "name", "openingHours", "slug", "state" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CrowdPattern_siteSlug_dayOfWeek_hour_idx" ON "CrowdPattern"("siteSlug", "dayOfWeek", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "CrowdPattern_siteSlug_dayOfWeek_hour_isHoliday_key" ON "CrowdPattern"("siteSlug", "dayOfWeek", "hour", "isHoliday");

-- CreateIndex
CREATE INDEX "VisitorStats_siteSlug_idx" ON "VisitorStats"("siteSlug");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorStats_siteSlug_year_key" ON "VisitorStats"("siteSlug", "year");
