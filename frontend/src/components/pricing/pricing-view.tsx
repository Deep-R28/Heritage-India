"use client";

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
import { localizePricing } from "@/lib/localize";

const tierMeta = [
  { key: "scholar", featured: false },
  { key: "curated", featured: true },
  { key: "odyssey", featured: false },
] as const;

export function PricingView({ pricing: rawPricing, sites }: { pricing: PricingData; sites: Site[] }) {
  const { t, i18n } = useTranslation();
  const pricing = localizePricing(rawPricing, i18n.language);
  const siteByName = new Map(sites.map((s) => [s.name, s]));
  const tierCopy = tierMeta.map((m) => ({
    ...m,
    title: t(`pricing.tiers.${m.key}.title`),
    description: t(`pricing.tiers.${m.key}.description`),
    features: t(`pricing.tiers.${m.key}.features`, { returnObjects: true }) as string[],
  }));

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:px-8">
      <Reveal className="mx-auto mb-20 max-w-3xl text-center">
        <h1 className="mb-6 font-headline text-5xl leading-tight text-foreground md:text-6xl">
          {t("pricing.hero.title")}
        </h1>
        <p className="font-body text-lg font-light text-foreground-muted md:text-xl">
          {t("pricing.hero.subtitle")}
        </p>
      </Reveal>

      {/* Monument entry fees */}
      <section className="mb-24">
        <div className="mb-8 flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="font-headline text-3xl text-foreground">{t("pricing.entryFees.heading")}</h2>
          <span className="border-b border-accent pb-1 font-label text-xs font-medium uppercase tracking-widest text-accent">
            {t("pricing.entryFees.currency")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricing.entryFees.map((fee, i) => {
            const site = siteByName.get(fee.siteName);
            return (
              <Reveal key={fee.siteId} delay={i * 0.08}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    {site && (
                      <Image
                        src={site.image}
                        alt={site.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <h3 className="font-headline text-2xl text-foreground">{fee.siteName}</h3>
                      {site && (
                        <p className="mt-1 font-label text-xs uppercase tracking-widest text-accent">
                          {site.region}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col justify-between gap-6 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">{t("pricing.entryFees.domestic")}</span>
                        <span className="font-medium text-foreground">₹{fee.indianInr}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">{t("pricing.entryFees.foreign")}</span>
                        <span className="font-medium text-foreground">₹{fee.foreignInr}</span>
                      </div>
                    </div>
                    {site && (
                      <Link href={`/sites/${site.slug}`}>
                        <Button variant="secondary" size="sm" className="w-full">
                          {t("pricing.entryFees.viewSite")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 font-body text-sm italic text-foreground-muted">{pricing.feeBreakdownNote}</p>
      </section>

      {/* Guide tiers */}
      <section>
        <div className="mb-8 flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="font-headline text-3xl text-foreground">{t("pricing.guidesSection.heading")}</h2>
        </div>
        <Card className="p-1">
          <div className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x md:divide-y-0">
            {tierCopy.map((tier, i) => {
              const rate = pricing.guideRates[i];
              const canonicalTier = rawPricing.guideRates[i]?.tier ?? "";
              return (
                <div
                  key={tier.title}
                  className={cn(
                    "relative flex h-full flex-col p-8 transition-colors duration-500 hover:bg-surface-hover/40",
                    tier.featured && "bg-accent/5",
                  )}
                >
                  {tier.featured && <div className="absolute inset-x-0 top-0 h-[2px] bg-accent" />}
                  <div className="mb-6">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-headline text-xl text-foreground">{tier.title}</h3>
                      {tier.featured && (
                        <span className="shrink-0 rounded-sm bg-accent px-2 py-1 font-label text-[10px] uppercase tracking-widest text-accent-foreground">
                          {t("pricing.guidesSection.recommended")}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-sm font-light text-foreground-muted">{tier.description}</p>
                  </div>
                  <div className="mb-8">
                    <div className="mb-1 font-headline text-3xl text-accent">
                      ₹{rate?.priceInr}
                      <span className="font-body text-lg text-foreground-muted">
                        {" "}
                        / {canonicalTier.includes("Multi") || canonicalTier.toLowerCase().includes("full")
                          ? t("pricing.guidesSection.perDay")
                          : t("pricing.guidesSection.perTrip")}
                      </span>
                    </div>
                  </div>
                  <ul className="mb-8 flex-grow space-y-3 font-body text-sm text-foreground">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Icon name="check" className="text-[18px] text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/guides/verify">
                    <Button className="w-full" variant={tier.featured ? "primary" : "secondary"}>
                      {t("pricing.guidesSection.bookCta")}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
