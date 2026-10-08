"use client";

import { useMemo, useState } from "react";
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

export function MapSelectorClient({ sites: rawSites }: { sites: Site[] }) {
  const { t, i18n } = useTranslation();
  const sites = useMemo(() => rawSites.map((s) => localizeSite(s, i18n.language)), [rawSites, i18n.language]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [crowdFilter, setCrowdFilter] = useState<(typeof CROWD_FILTERS)[number]>("Any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Site | undefined>();

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
        onSelect={setSelected}
        flyTo={selected ? { lat: selected.lat, lng: selected.lng } : undefined}
        className="h-full w-full"
      />

      {/* Search bar — top-left overlay */}
      <div className="glass-panel absolute left-4 top-24 z-[1000] flex w-[calc(100%-2rem)] max-w-sm items-center gap-2 rounded-full px-4 py-3 md:left-8 md:top-28">
        <Icon name="search" className="text-foreground-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("map.searchPlaceholder") ?? undefined}
          className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
        />
      </div>

      {/* Filter panel — top-right overlay */}
      <div className="absolute right-4 top-24 z-[1000] md:right-8 md:top-28">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 font-label text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent"
        >
          <Icon name="tune" className="text-base" />
          {t("map.filters")}
        </button>
        {filtersOpen && (
          <div className="glass-panel absolute right-0 top-full mt-2 w-72 rounded-xl p-5">
            <div className="mb-5">
              <span className="mb-2 block font-label text-xs uppercase tracking-widest text-foreground-muted">
                {t("map.category")}
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-label text-[10px] uppercase tracking-widest transition-colors",
                      category === c
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hairline text-foreground-muted hover:border-accent/40",
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
              <div className="flex flex-wrap gap-2">
                {CROWD_FILTERS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCrowdFilter(c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-label text-[10px] uppercase tracking-widest transition-colors",
                      crowdFilter === c
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hairline text-foreground-muted hover:border-accent/40",
                    )}
                  >
                    {t(crowdFilterKey[c])}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
            <button
              onClick={() => setSelected(undefined)}
              aria-label="Close"
              className="mb-4 text-foreground-muted hover:text-accent"
            >
              <Icon name="close" />
            </button>
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
              <Image src={selected.image} alt={selected.name} fill sizes="384px" className="object-cover" />
            </div>
            <h2 className="mb-1 font-headline text-2xl text-foreground">{selected.name}</h2>
            <p className="mb-4 flex items-center gap-1 font-body text-sm text-foreground-muted">
              <Icon name="location_on" className="text-sm" />
              {selected.region} &middot; {t("map.distanceAway", { km: selected.distanceKm })}
            </p>
            <div className="mb-6 flex items-center gap-4">
              <CrowdGaugeRadial percent={selected.crowdPercent} />
              <div className="font-body text-sm text-foreground-muted">
                {t("map.currentCrowdAt", { site: selected.name })}
              </div>
            </div>
            <Link href={`/sites/${selected.slug}`}>
              <Button className="w-full">{t("common.viewDetails")}</Button>
            </Link>
          </>
        )}
      </div>

      {/* Back to list link */}
      <Link
        href="/explore"
        className="glass-panel absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2 rounded-full px-6 py-3 font-label text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent"
      >
        {t("map.backToList")}
      </Link>
    </div>
  );
}
