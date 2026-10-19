"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Guide, Site } from "@/lib/data";
import type { PricingData } from "@/components/pricing/pricing-types";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { VerifiedSeal } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { localizeGuide, localizePricing, localizeSite } from "@/lib/localize";
import nearbySitesRaw from "@/data/nearby-sites.json";

export function GuideVerificationClient({ guides: rawGuides, pricing: rawPricing }: { guides: Guide[]; pricing: PricingData }) {
  const { t, i18n } = useTranslation();
  const guides = useMemo(() => rawGuides.map((g) => localizeGuide(g, i18n.language)), [rawGuides, i18n.language]);
  const pricing = useMemo(() => localizePricing(rawPricing, i18n.language), [rawPricing, i18n.language]);
  const [query, setQuery] = useState("");
  const [selectedGuideForBooking, setSelectedGuideForBooking] = useState<Guide | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.asiId ?? "").toLowerCase().includes(q),
    );
  }, [guides, query]);

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:px-8">
      <Reveal className="mb-12 text-center">
        <span className="mb-4 block font-label text-xs uppercase tracking-widest text-accent">
          {t("guides.eyebrow")}
        </span>
        <h1 className="mb-4 font-headline text-3xl text-foreground md:text-5xl">{t("guides.heading")}</h1>
        <p className="mx-auto max-w-xl font-body text-foreground-muted">{t("guides.subtitle")}</p>
      </Reveal>

      <Reveal className="glass-panel mb-12 flex items-center gap-3 rounded-full px-6 py-4">
        <Icon name="search" className="text-foreground-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("guides.searchPlaceholder") ?? undefined}
          className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
        />
      </Reveal>

      <div className="flex flex-col gap-6">
        {results.map((guide, i) => (
          <Reveal key={guide.id} delay={i * 0.06}>
            <Card className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-hairline">
                    {guide.photo ? (
                      <Image src={guide.photo} alt={guide.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-hover font-headline text-lg text-foreground-muted">
                        {guide.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="font-headline text-xl text-foreground">{guide.name}</h2>
                      {guide.verified && <VerifiedSeal />}
                    </div>
                    <p className="font-body text-sm text-foreground-muted">
                      {guide.specialty} &middot; {guide.region}
                    </p>
                    <p className="mt-1 font-label text-xs uppercase tracking-widest text-foreground-muted">
                      {guide.languages.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-8">
                  <div className="text-right">
                    <div className="font-label text-xs uppercase tracking-widest text-foreground-muted">
                      {t("guides.experience")}
                    </div>
                    <div className="font-headline text-lg text-accent">{guide.experienceYears} {t("guides.yearsShort")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label text-xs uppercase tracking-widest text-foreground-muted">
                      {t("guides.rating")}
                    </div>
                    <div className="flex items-center gap-1 font-headline text-lg text-accent">
                      {guide.rating} <Icon name="star" filled className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar for booking */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-3.5">
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">Standard Rate:</span>
                  <span className="font-mono text-sm font-semibold text-accent">₹{guide.rateInr}/hr</span>
                  <span className="text-[11px] text-foreground-muted">(&asymp; ₹{guide.rateInr * 3} for 3 hrs)</span>
                </div>
                {guide.verified ? (
                  <button
                    type="button"
                    onClick={() => setSelectedGuideForBooking(guide)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-label text-xs font-semibold uppercase tracking-wider text-background shadow transition-all hover:bg-accent/90 cursor-pointer"
                  >
                    <Icon name="calendar_today" className="text-sm" />
                    Book This Guide
                  </button>
                ) : (
                  <span className="font-label text-xs uppercase tracking-wider text-warning">
                    Unverified &middot; Booking Disabled
                  </span>
                )}
              </div>

              {!guide.verified && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
                  <Icon name="warning" className="mt-0.5 text-warning" />
                  <p className="font-body text-sm text-foreground-muted">{t("guides.unverifiedWarning")}</p>
                </div>
              )}
            </Card>
          </Reveal>
        ))}
        {results.length === 0 && (
          <p className="py-16 text-center font-body text-sm text-foreground-muted">
            {t("guides.noResults", { query })}
          </p>
        )}
      </div>

      <Reveal className="mt-16">
        <h2 className="mb-6 text-center font-headline text-2xl text-foreground">{t("guides.rateTable.heading")}</h2>
        <div className="overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="px-4 py-3 font-label text-xs uppercase tracking-widest text-foreground-muted">{t("guides.rateTable.tier")}</th>
                <th className="px-4 py-3 font-label text-xs uppercase tracking-widest text-foreground-muted">{t("guides.rateTable.price")}</th>
              </tr>
            </thead>
            <tbody>
              {pricing.guideRates.map((rate) => (
                <tr key={rate.tier} className="border-b border-hairline-strong/60 last:border-b-0">
                  <td className="px-4 py-4 font-body text-sm text-foreground">{rate.tier}</td>
                  <td className="px-4 py-4 font-body text-sm text-accent">₹{rate.priceInr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* Site Selection Modal for chosen guide */}
      {selectedGuideForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedGuideForBooking(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <Icon name="close" className="text-xl" />
            </button>

            <div className="mb-5 pr-8">
              <span className="font-label text-xs uppercase tracking-widest text-accent">Select Monument to Visit</span>
              <h3 className="mt-1 font-headline text-xl text-foreground md:text-2xl">
                Choose Site for {selectedGuideForBooking.name}
              </h3>
              <p className="mt-1 font-body text-xs text-foreground-muted">
                Please select the heritage destination you wish to visit with this certified guide (₹{selectedGuideForBooking.rateInr}/hr):
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {nearbySitesRaw.map((rawSite) => {
                  const site = localizeSite(rawSite as unknown as Site, i18n.language);
                  return (
                  <Link
                    key={site.slug}
                    href={`/checkout?guide=${selectedGuideForBooking.id}&site=${site.slug}`}
                    onClick={() => setSelectedGuideForBooking(null)}
                    className="group flex items-center gap-3 rounded-xl border border-hairline bg-surface-elevated/60 p-3 transition-all hover:border-accent hover:bg-accent/5 cursor-pointer"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-hairline">
                      <Image
                        src={site.image}
                        alt={site.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-headline text-sm font-semibold text-foreground group-hover:text-accent">
                        {site.name}
                      </h4>
                      <p className="truncate text-xs text-foreground-muted">{site.region}</p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-accent">
                        {site.priceInr === 0 ? (t("explore.freeEntry") || "Free Entry") : `₹${site.priceInr} ${t("siteDetail.entryFee") || "entry fee"}`}
                      </p>
                    </div>
                    <Icon
                      name="arrow_forward"
                      className="text-base text-foreground-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-xs text-foreground-muted">
              <span>Selected guide rate: ₹{selectedGuideForBooking.rateInr}/hr</span>
              <button
                type="button"
                onClick={() => setSelectedGuideForBooking(null)}
                className="rounded-lg border border-hairline px-4 py-1.5 font-label text-xs uppercase tracking-wider text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
