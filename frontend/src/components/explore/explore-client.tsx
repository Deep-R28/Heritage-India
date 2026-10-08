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

export function ExploreClient({ sites }: { sites: Site[] }) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Site | undefined>();
  const localizedSites = useMemo(() => sites.map((s) => localizeSite(s, i18n.language)), [sites, i18n.language]);

  const filtered = useMemo(
    () => (category === "All" ? localizedSites : localizedSites.filter((s) => s.category === category)),
    [localizedSites, category],
  );

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
      </div>

      {/* List (right) */}
      <div className="flex w-full flex-col overflow-hidden md:w-1/2">
        <div className="flex gap-2 overflow-x-auto border-b border-hairline px-6 py-4 hide-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 font-label text-xs uppercase tracking-widest transition-colors",
                category === c
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-hairline text-foreground-muted hover:border-accent/40",
              )}
            >
              {t(categoryLabelKey(c))}
            </button>
          ))}
        </div>

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
                    {site.region} &middot; {site.distanceKm} km
                  </p>
                  <CrowdGaugeBar percent={site.crowdPercent} />
                </div>
                <Link
                  href={`/sites/${site.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-foreground-muted transition-colors hover:text-accent"
                >
                  <Icon name="chevron_right" />
                </Link>
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
