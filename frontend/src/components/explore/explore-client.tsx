"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { Site } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { CrowdGaugeBar } from "@/components/ui/crowd-gauge";
import { SiteMapLazy } from "@/components/map/site-map-lazy";
import { CATEGORIES, categoryLabelKey } from "@/lib/categories";
import { localizeSite } from "@/lib/localize";
import { api } from "@/lib/api";

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

export function ExploreClient({
  sites,
  initialSiteSlug,
}: {
  sites: Site[];
  initialSiteSlug?: string;
}) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState("All");

  // User live geolocation state
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
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  const requestLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setLocationStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setLocationStatus("granted");
          try {
            localStorage.setItem("heritage_user_coords", JSON.stringify(coords));
          } catch {}
        },
        (err) => {
          console.warn("Geolocation permission error:", err.message);
          setLocationStatus("denied");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const localizedSites = useMemo(() => {
    return sites.map((s) => {
      const loc = localizeSite(s, i18n.language);
      if (userLocation && typeof s.lat === "number" && typeof s.lng === "number") {
        const realKm = calculateHaversineDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
        return { ...loc, distanceKm: realKm };
      }
      return loc;
    });
  }, [sites, i18n.language, userLocation]);

  const [selected, setSelected] = useState<Site | undefined>(() => {
    if (initialSiteSlug) {
      return sites.find((s) => s.slug === initialSiteSlug);
    }
    return undefined;
  });

  useEffect(() => {
    if (initialSiteSlug) {
      const match = localizedSites.find((s) => s.slug === initialSiteSlug);
      if (match) setSelected(match);
    }
  }, [initialSiteSlug, localizedSites]);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const list: string[] = JSON.parse(localStorage.getItem("heritage_saved_sites") || "[]");
        setSavedIds(new Set(list));
      } catch {
        // ignore
      }
    }
  }, []);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return localizedSites.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const rawSite = sites.find((r) => r.id === s.id);
        const matchesName = s.name.toLowerCase().includes(q) || (rawSite ? rawSite.name.toLowerCase().includes(q) : false);
        const matchesRegion = s.region.toLowerCase().includes(q) || (rawSite ? rawSite.region.toLowerCase().includes(q) : false);
        const matchesCategory = s.category.toLowerCase().includes(q);
        const matchesZone = s.zone ? s.zone.toLowerCase().includes(q) : false;
        const matchesType = s.type ? s.type.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesRegion && !matchesCategory && !matchesZone && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [localizedSites, category, query, sites]);

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col md:flex-row">
      {/* Map (left, desktop) */}
      <div className="relative h-72 w-full shrink-0 md:h-full md:w-1/2">
        <SiteMapLazy
          sites={filtered}
          selectedId={selected?.id}
          onSelect={setSelected}
          flyTo={selected ? { lat: selected.lat, lng: selected.lng } : undefined}
          className="h-full w-full"
        />

        {/* Quick floating detail pill on map when pointer clicked */}
        {selected && (
          <div className="glass-panel absolute bottom-4 left-4 right-4 z-[1000] flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-background/95 p-3 shadow-2xl backdrop-blur-md md:hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={selected.image} alt={selected.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="truncate font-headline text-sm font-bold text-foreground">{selected.name}</h4>
                <p className="truncate text-[11px] text-foreground-muted">{selected.region}</p>
              </div>
            </div>
            <Link
              href={`/sites/${selected.slug}`}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 font-label text-xs font-semibold text-obsidian shadow hover:bg-accent/90"
            >
              {t("explore.viewDetails") || "View Details"}
            </Link>
          </div>
        )}
      </div>

      {/* List (right) */}
      <div className="flex w-full flex-col overflow-hidden md:w-1/2">
        {/* Search Bar with Search Button */}
        <div className="border-b border-hairline bg-surface/30 px-6 py-3.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(searchInput.trim());
              if (filtered.length > 0) {
                setSelected(filtered[0]);
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-grow">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === "") setQuery("");
                }}
                placeholder={t("explore.searchPlaceholder") || "Search places, cities, states, temples..."}
                className="w-full rounded-lg border border-hairline bg-surface/70 py-2 pl-9 pr-8 font-body text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setQuery("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-accent"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-label text-xs font-semibold uppercase tracking-wider text-obsidian shadow-sm transition-all hover:bg-accent/90"
            >
              <Icon name="travel_explore" className="text-sm" />
              {t("explore.search") || "Search"}
            </button>
          </form>
          {query && (
            <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
              <span>{t("explore.resultsFor") || "Results for"} &ldquo;{query}&rdquo; ({filtered.length} found)</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setQuery("");
                }}
                className="text-accent hover:underline text-[11px]"
              >
                {t("explore.resetSearch") || "Reset search"}
              </button>
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto border-b border-hairline px-6 py-3 hide-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 font-label text-xs uppercase tracking-widest transition-colors",
                category === c
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-hairline text-foreground-muted hover:border-accent/40",
              )}
            >
              {t(categoryLabelKey(c))}
            </button>
          ))}
        </div>

        {/* GPS Live Distance Banner */}
        <div className="flex items-center justify-between border-b border-hairline bg-surface/25 px-6 py-2 text-[11px] text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", userLocation ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
            {userLocation ? (
              <span className="text-emerald-400 font-medium">Real distance away calculated from your location</span>
            ) : locationStatus === "requesting" ? (
              <span>Detecting your location for live distance...</span>
            ) : (
              <span>Click to calculate exact distance away</span>
            )}
          </span>
          {!userLocation && (
            <button
              type="button"
              onClick={requestLocation}
              className="font-label text-[10px] uppercase tracking-wider text-accent hover:underline cursor-pointer"
            >
              Enable GPS Location
            </button>
          )}
        </div>

        {/* Selected Site Banner (when marker or card clicked) */}
        {selected && (
          <div className="border-b border-accent/40 bg-accent/5 px-6 py-3.5 transition-all">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-accent">
                <Icon name="place" className="text-xs" />
                {t("explore.selectedSiteOnMap") || "Selected Site on Map"}
              </span>
              <button
                type="button"
                onClick={() => setSelected(undefined)}
                className="text-xs text-foreground-muted hover:text-accent"
                title="Deselect"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-accent/20">
                <Image src={selected.image} alt={selected.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-grow">
                <h4 className="truncate font-headline text-base font-bold text-foreground">{selected.name}</h4>
                <p className="flex items-center gap-1 text-xs text-foreground-muted">
                  <Icon name="location_on" className="text-xs" />
                  {selected.region} · {selected.priceInr === 0 ? (t("explore.freeEntry") || "Free Entry") : `₹${selected.priceInr}`}
                  {selected.distanceKm !== undefined ? ` · ${selected.distanceKm.toLocaleString()} km away` : ""}
                  {selected.googleRating ? ` · ★${selected.googleRating}` : ""}
                </p>
                <div className="mt-1">
                  <CrowdGaugeBar percent={selected.crowdPercent} />
                </div>
              </div>
              <Link
                href={`/sites/${selected.slug}`}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-3.5 py-2 font-label text-xs font-semibold uppercase tracking-wider text-obsidian shadow hover:bg-accent/90"
              >
                {t("explore.viewDetails") || "View Details"}
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            {filtered.map((site) => (
              <button
                key={site.id}
                onClick={() => setSelected(site)}
                className={cn(
                  "glass-panel flex items-center gap-4 rounded-xl p-3 text-left transition-all hover:-translate-y-0.5",
                  selected?.id === site.id && "border-accent/60",
                )}
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={site.image} alt={site.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="truncate font-headline text-lg text-foreground">{site.name}</h3>
                  <p className="mb-2 flex items-center gap-1 font-body text-xs text-foreground-muted">
                    <Icon name="location_on" className="text-sm" />
                    {site.region} {site.googleRating ? `· ★${site.googleRating}` : ""} ·{" "}
                    <span className={userLocation ? "text-accent font-semibold" : ""}>
                      {site.distanceKm.toLocaleString()} km away
                    </span>
                  </p>
                  <CrowdGaugeBar percent={site.crowdPercent} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const isSaved = savedIds.has(site.id) || savedIds.has(site.slug);
                      const next = new Set(savedIds);
                      if (isSaved) {
                        next.delete(site.id);
                        next.delete(site.slug);
                        setSavedIds(next);
                        await api.me.removeSavedSite(site.id);
                      } else {
                        next.add(site.id);
                        setSavedIds(next);
                        await api.me.saveSite(site.id);
                      }
                    }}
                    className={`p-1.5 transition-colors ${
                      savedIds.has(site.id) || savedIds.has(site.slug)
                        ? "text-accent"
                        : "text-foreground-muted hover:text-accent"
                    }`}
                    title={
                      savedIds.has(site.id) || savedIds.has(site.slug)
                        ? (t("explore.savedToDashboard") || "Saved to Dashboard")
                        : (t("explore.saveToMySites") || "Save to My Sites")
                    }
                  >
                    <Icon
                      name={savedIds.has(site.id) || savedIds.has(site.slug) ? "bookmark" : "bookmark_border"}
                      className="text-base"
                    />
                  </button>
                  <Link
                    href={`/sites/${site.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-foreground-muted transition-colors hover:text-accent"
                  >
                    <Icon name="chevron_right" />
                  </Link>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="py-12 text-center font-body text-sm text-foreground-muted">
                {t("explore.noResults")}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-hairline px-6 py-4">
          <Link
            href="/explore/map"
            className="flex items-center justify-center gap-2 font-label text-xs uppercase tracking-widest text-accent transition-opacity hover:opacity-80"
          >
            <Icon name="map" className="text-sm" />
            {t("explore.openFullMap")}
          </Link>
        </div>
      </div>
    </div>
  );
}
