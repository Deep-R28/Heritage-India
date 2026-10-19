"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { Site } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { CrowdGaugeRadial } from "@/components/ui/crowd-gauge";
import { SiteMapLazy } from "@/components/map/site-map-lazy";
import { cn } from "@/lib/cn";
import { CATEGORIES, categoryLabelKey } from "@/lib/categories";
import { localizeSite } from "@/lib/localize";

const CROWD_FILTERS = ["Any", "Quiet", "Moderate", "Busy"] as const;
const crowdFilterKey: Record<(typeof CROWD_FILTERS)[number], string> = {
  Any: "map.crowdFilters.any",
  Quiet: "map.crowdFilters.quiet",
  Moderate: "map.crowdFilters.moderate",
  Busy: "map.crowdFilters.busy",
};

function calculateHaversineDistanceKm(userLat: number, userLng: number, siteLat: number, siteLng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((siteLat - userLat) * Math.PI) / 180;
  const dLon = ((siteLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((siteLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return dist < 10 ? Math.round(dist * 10) / 10 : Math.round(dist);
}

export function MapSelectorClient({
  sites: rawSites,
  initialSiteSlug,
}: {
  sites: Site[];
  initialSiteSlug?: string;
}) {
  const { t, i18n } = useTranslation();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("heritage_user_coords");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          try {
            localStorage.setItem("heritage_user_coords", JSON.stringify(coords));
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, []);

  const sites = useMemo(() => {
    return rawSites.map((s) => {
      const loc = localizeSite(s, i18n.language);
      if (userLocation && typeof s.lat === "number" && typeof s.lng === "number") {
        const realKm = calculateHaversineDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
        return { ...loc, distanceKm: realKm };
      }
      return loc;
    });
  }, [rawSites, i18n.language, userLocation]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [crowdFilter, setCrowdFilter] = useState<(typeof CROWD_FILTERS)[number]>("Any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Site | undefined>(() => {
    if (initialSiteSlug) {
      return rawSites.find((s) => s.slug === initialSiteSlug);
    }
    return undefined;
  });

  useEffect(() => {
    if (initialSiteSlug) {
      const match = sites.find((s) => s.slug === initialSiteSlug);
      if (match) setSelected(match);
    }
  }, [initialSiteSlug, sites]);

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (crowdFilter === "Quiet" && s.crowdPercent >= 40) return false;
      if (crowdFilter === "Moderate" && (s.crowdPercent < 40 || s.crowdPercent >= 75)) return false;
      if (crowdFilter === "Busy" && s.crowdPercent < 75) return false;
      if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.region.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [sites, category, crowdFilter, query]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <SiteMapLazy
        sites={filtered}
        selectedId={selected?.id}
        onSelect={(site) => {
          setSelected(site);
          setFiltersOpen(false);
        }}
        flyTo={selected ? { lat: selected.lat, lng: selected.lng } : undefined}
        className="h-full w-full"
      />

      {/* Top Controls — Back to Site Details button + Search bar */}
      <div className="absolute left-4 top-24 z-[1000] flex max-w-[calc(100%-6rem)] flex-wrap items-center gap-2.5 md:left-8 md:top-28">
        {(selected || initialSiteSlug) && (
          <Link
            href={`/sites/${selected?.slug || initialSiteSlug}`}
            className="glass-panel flex shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-background/90 px-4 py-2 font-label text-xs font-semibold uppercase tracking-wider text-accent shadow-xl backdrop-blur-md transition-all hover:bg-accent hover:text-obsidian"
            title="Return to site detail page"
          >
            <Icon name="arrow_back" className="text-sm" />
            {t("common.back")} {selected?.name || ""}
          </Link>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (filtered.length > 0 && query.trim()) {
              setSelected(filtered[0]);
            }
          }}
          className="glass-panel flex w-full max-w-sm items-center gap-2 rounded-full border border-accent/25 bg-background/90 py-1.5 pl-4 pr-1.5 shadow-2xl backdrop-blur-md sm:w-auto"
        >
          <Icon name="search" className="shrink-0 text-foreground-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("map.searchPlaceholder") || "Search places, cities, states..."}
            className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-foreground-muted transition-colors hover:text-accent"
              title="Clear search"
            >
              <Icon name="close" className="text-sm" />
            </button>
          )}
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-4 py-2 font-label text-xs font-semibold uppercase tracking-wider text-obsidian shadow-sm transition-all hover:bg-accent/90"
          >
            <Icon name="travel_explore" className="text-sm" />
            Search
          </button>
        </form>
      </div>

      {/* Filter panel — top-right overlay */}
      <div className="absolute right-4 top-24 z-[1000] md:right-8 md:top-28">
        <button
          onClick={() => {
            setFiltersOpen((o) => !o);
            if (!filtersOpen && selected) {
              setSelected(undefined); // Close slide-in panel so it does not overlap with filter panel
            }
          }}
          className={cn(
            "glass-panel flex items-center gap-2 rounded-full px-4 py-2.5 font-label text-xs uppercase tracking-widest text-foreground shadow-xl backdrop-blur-md transition-all hover:text-accent cursor-pointer",
            filtersOpen ? "border-accent bg-accent/20 text-accent font-semibold" : "border-hairline"
          )}
        >
          <Icon name="tune" className="text-base" />
          {t("map.filters")}
          {(category !== "All" || crowdFilter !== "Any") && (
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          )}
        </button>

        {filtersOpen && (
          <>
            {/* Click-outside backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="glass-panel absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-hairline bg-surface/95 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
                <span className="font-headline text-xs font-semibold uppercase tracking-wider text-accent">
                  {t("map.filters")}
                </span>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full p-1 text-foreground-muted hover:bg-surface hover:text-foreground cursor-pointer"
                  aria-label="Close filters"
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>

              <div className="mb-5">
                <span className="mb-2 block font-label text-xs uppercase tracking-widest text-foreground-muted">
                  {t("map.category")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-full border px-3 py-1 font-label text-[10px] uppercase tracking-widest transition-colors cursor-pointer",
                        category === c
                          ? "border-accent bg-accent/15 text-accent font-bold"
                          : "border-hairline text-foreground-muted hover:border-accent/40 hover:text-foreground",
                      )}
                    >
                      {t(categoryLabelKey(c))}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block font-label text-xs uppercase tracking-widest text-foreground-muted">
                  {t("map.crowdLevel")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CROWD_FILTERS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCrowdFilter(c)}
                      className={cn(
                        "rounded-full border px-3 py-1 font-label text-[10px] uppercase tracking-widest transition-colors cursor-pointer",
                        crowdFilter === c
                          ? "border-accent bg-accent/15 text-accent font-bold"
                          : "border-hairline text-foreground-muted hover:border-accent/40 hover:text-foreground",
                      )}
                    >
                      {t(crowdFilterKey[c])}
                    </button>
                  ))}
                </div>
              </div>

              {(category !== "All" || crowdFilter !== "Any") && (
                <div className="mt-4 border-t border-hairline pt-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("All");
                      setCrowdFilter("Any");
                    }}
                    className="font-label text-[10px] uppercase tracking-wider text-accent hover:underline cursor-pointer"
                  >
                    {t("explore.resetSearch") || "Reset Filters"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Slide-in site panel */}
      <div
        className={cn(
          "glass-panel absolute bottom-0 right-0 top-0 z-[1000] w-full max-w-sm overflow-y-auto p-6 transition-transform duration-300 ease-out md:top-20",
          selected ? "translate-x-0" : "translate-x-full",
        )}
      >
        {selected && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <Link
                href={`/sites/${selected.slug}`}
                className="flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:text-accent/80"
              >
                <Icon name="arrow_back" className="text-sm" />
                {t("common.back")}
              </Link>
              <button
                onClick={() => setSelected(undefined)}
                aria-label="Close"
                className="text-foreground-muted hover:text-accent p-1"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-accent/20">
              <Image src={selected.image} alt={selected.name} fill sizes="384px" className="object-cover" />
              <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
                  {t(categoryLabelKey(selected.category))}
                </span>
                {selected.zone && (
                  <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-300 backdrop-blur-sm">
                    {selected.zone}
                  </span>
                )}
              </div>
              {selected.googleRating && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                  ★ {selected.googleRating}
                </span>
              )}
            </div>

            <h2 className="mb-1 font-headline text-2xl text-foreground">{selected.name}</h2>
            <p className="mb-4 flex items-center gap-1 font-body text-sm text-foreground-muted">
              <Icon name="location_on" className="text-sm" />
              {selected.region} &middot; {t("map.distanceAway", { km: selected.distanceKm })}
            </p>

            <div className="mb-4 flex items-center justify-between rounded-lg border border-hairline bg-surface/50 p-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-stone-400">{t("siteDetail.entryFee") || "Entry Fee"}</span>
                <span className="font-semibold text-accent">
                  {selected.priceInr === 0 ? (t("explore.freeEntry") || "Free Entry") : `₹${selected.priceInr}`}
                </span>
              </div>
              {selected.timeNeeded && (
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400">{t("pricing.timeNeeded") || "Time Needed"}</span>
                  <span className="font-semibold text-foreground">~{selected.timeNeeded} hrs</span>
                </div>
              )}
            </div>

            <div className="mb-6 flex items-center gap-4">
              <CrowdGaugeRadial percent={selected.crowdPercent} />
              <div className="font-body text-sm text-foreground-muted">
                {t("map.currentCrowdAt", { site: selected.name })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/sites/${selected.slug}`}>
                <Button className="w-full">
                  <Icon name="info" className="text-sm" />
                  {t("common.viewDetails")}
                </Button>
              </Link>
              <Link href={`/checkout?site=${selected.slug}`}>
                <Button variant="secondary" className="w-full">
                  <Icon name="confirmation_number" className="text-sm" />
                  {t("pricing.guidesSection.bookCta") || "Book Visit & Guide"}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom bar with back options */}
      <div className="glass-panel absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-2 rounded-full p-1.5 shadow-2xl backdrop-blur-md border border-hairline bg-background/90">
        {(selected || initialSiteSlug) && (
          <Link
            href={`/sites/${selected?.slug || initialSiteSlug}`}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-label text-xs font-semibold uppercase tracking-wider text-obsidian shadow transition-all hover:bg-accent/90"
          >
            <Icon name="arrow_back" className="text-sm" />
            {t("common.back")} {selected?.name || ""}
          </Link>
        )}
        <Link
          href="/explore"
          className="flex items-center gap-1.5 rounded-full px-4 py-2 font-label text-xs uppercase tracking-widest text-foreground-muted transition-colors hover:text-accent"
        >
          <Icon name="format_list_bulleted" className="text-sm" />
          {t("map.backToList")}
        </Link>
      </div>
    </div>
  );
}
