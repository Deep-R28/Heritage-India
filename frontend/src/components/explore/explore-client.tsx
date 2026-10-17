"use client";

import { useMemo, useState } from "react";
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

export function ExploreClient({ sites }: { sites: Site[] }) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Site | undefined>();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const localizedSites = useMemo(() => sites.map((s) => localizeSite(s, i18n.language)), [sites, i18n.language]);

  const filtered = useMemo(() => {
    return localizedSites.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRegion = s.region.toLowerCase().includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        const matchesZone = s.zone ? s.zone.toLowerCase().includes(q) : false;
        const matchesType = s.type ? s.type.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesRegion && !matchesCategory && !matchesZone && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [localizedSites, category, query]);

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
              View Details
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
              Search
            </button>
          </form>
          {query && (
            <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
              <span>Results for &ldquo;{query}&rdquo; ({filtered.length} found)</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setQuery("");
                }}
                className="text-accent hover:underline text-[11px]"
              >
                Reset search
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

        {/* Selected Site Banner (when marker or card clicked) */}
        {selected && (
          <div className="border-b border-accent/40 bg-accent/5 px-6 py-3.5 transition-all">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-accent">
                <Icon name="place" className="text-xs" />
                Selected Site on Map
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
                  {selected.region} · {selected.priceInr === 0 ? "Free Entry" : `₹${selected.priceInr}`}
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
                View Details
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
                    {site.region} {site.googleRating ? `· ★${site.googleRating}` : ""} · {site.distanceKm} km
                  </p>
                  <CrowdGaugeBar percent={site.crowdPercent} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await api.me.saveSite(site.id);
                        alert(`Added ${site.name} to Saved Sites!`);
                      } catch {
                        // ignore
                      }
                    }}
                    className="p-1 text-foreground-muted hover:text-accent"
                    title="Save to My Sites"
                  >
                    <Icon name="bookmark_border" className="text-base" />
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
