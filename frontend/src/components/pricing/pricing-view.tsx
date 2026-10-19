"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { PricingData } from "./pricing-types";
import type { Site } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { localizePricing, localizeSite } from "@/lib/localize";
import { CATEGORIES, categoryLabelKey } from "@/lib/categories";

export function PricingView({ pricing: rawPricing, sites }: { pricing: PricingData; sites: Site[] }) {
  const { t, i18n } = useTranslation();
  const pricing = localizePricing(rawPricing, i18n.language);
  const localizedSites = useMemo(() => sites.map((s) => localizeSite(s, i18n.language)), [sites, i18n.language]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredSites = useMemo(() => {
    return localizedSites.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const raw = sites.find((r) => r.id === s.id);
        const matchesName = s.name.toLowerCase().includes(q) || (raw ? raw.name.toLowerCase().includes(q) : false);
        const matchesRegion = s.region.toLowerCase().includes(q) || (raw ? raw.region.toLowerCase().includes(q) : false);
        const matchesCategory = s.category.toLowerCase().includes(q);
        if (!matchesName && !matchesRegion && !matchesCategory) return false;
      }
      return true;
    });
  }, [localizedSites, category, search, sites]);

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:px-8">
      <Reveal className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="mb-4 font-headline text-5xl leading-tight text-foreground md:text-6xl">
          {t("pricing.hero.title")}
        </h1>
        <p className="font-body text-lg font-light text-foreground-muted md:text-xl">
          Official, transparent ticket entry fees across all {sites.length} heritage monuments in India.
        </p>
      </Reveal>

      {/* Monument entry fees */}
      <section className="mb-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
          <div>
            <h2 className="font-headline text-3xl text-foreground">{t("pricing.entryFees.heading")}</h2>
            <p className="mt-1 font-body text-xs text-foreground-muted">
              Standard universal entrance fee per visitor for all tourists.
            </p>
          </div>
          <span className="self-start sm:self-auto border-b border-accent pb-1 font-label text-xs font-medium uppercase tracking-widest text-accent">
            {t("pricing.entryFees.currency")} (All Tourists)
          </span>
        </div>

        {/* Search and Category Filter Bar */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="relative w-full max-w-md">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-foreground-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("explore.searchPlaceholder") || "Search places, cities, states..."}
              className="w-full rounded-xl border border-hairline bg-surface py-2.5 pl-10 pr-9 font-body text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-accent"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1 font-label text-xs uppercase tracking-wider transition-colors",
                  category === c
                    ? "border-accent bg-accent/15 text-accent font-semibold"
                    : "border-hairline text-foreground-muted hover:border-accent/40 hover:text-foreground",
                )}
              >
                {t(categoryLabelKey(c))}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site, i) => (
            <Reveal key={site.id} delay={Math.min(i * 0.04, 0.4)}>
              <Card className="flex h-full flex-col overflow-hidden transition-all hover:border-accent/40">
                <div className="relative h-48 w-full bg-surface-container">
                  {site.image ? (
                    <Image
                      src={site.image}
                      alt={site.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-foreground-muted">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
                      {t(categoryLabelKey(site.category))}
                    </span>
                    {site.zone && (
                      <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-300 backdrop-blur-sm">
                        {site.zone}
                      </span>
                    )}
                  </div>
                  {site.googleRating && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                      ★ {site.googleRating}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-headline text-xl font-bold text-foreground line-clamp-1">{site.name}</h3>
                    <p className="mt-0.5 font-label text-xs uppercase tracking-wider text-accent/90 line-clamp-1">
                      {site.region}
                    </p>
                  </div>
                </div>

                <div className="flex flex-grow flex-col justify-between gap-5 p-5">
                  <div className="space-y-2.5">
                    {/* Common Universal Entry Fee */}
                    <div className="flex items-center justify-between rounded-lg bg-surface-elevated/40 p-2.5 border border-hairline">
                      <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">
                        {t("siteDetail.entryFee") || "Ticket Price"}
                      </span>
                      <span className="font-mono text-base font-bold text-accent">
                        {site.priceInr === 0 ? (t("explore.freeEntry") || "Free Entry") : `₹${site.priceInr}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
                      <span>{t("siteDetail.openHours") || "Hours"}</span>
                      <span className="truncate max-w-[170px] text-right font-medium text-foreground">
                        {site.openHours || "Open All Days"}
                      </span>
                    </div>

                    {site.timeNeeded && (
                      <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
                        <span>Time Needed</span>
                        <span className="font-medium text-foreground">~{site.timeNeeded} hrs</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline">
                    <Link href={`/sites/${site.slug}`}>
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        {t("pricing.entryFees.viewSite") || "View Site"}
                      </Button>
                    </Link>
                    <Link href={`/checkout?site=${site.slug}&partySize=2`}>
                      <Button size="sm" className="w-full text-xs">
                        Book Tickets
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="py-16 text-center">
            <Icon name="search_off" className="mx-auto mb-3 text-4xl text-foreground-muted" />
            <p className="font-headline text-lg text-foreground">No monuments found matching &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-3 text-xs uppercase tracking-wider text-accent hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        <p className="mt-8 font-body text-sm italic text-foreground-muted text-center">
          {pricing.feeBreakdownNote || "All prices shown include ASI entry fees, applicable taxes, and platform service charge — no hidden costs at checkout."}
        </p>
      </section>
    </div>
  );
}
