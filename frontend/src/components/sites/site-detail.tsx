"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrowdGaugeRadial } from "@/components/ui/crowd-gauge";
import { Reveal } from "@/components/ui/reveal";
import { categoryLabelKey } from "@/lib/categories";
import { localizeSite } from "@/lib/localize";

export function SiteDetailView({ site: rawSite, alternatives: rawAlternatives }: { site: Site; alternatives: Site[] }) {
  const { t, i18n } = useTranslation();
  const site = localizeSite(rawSite, i18n.language);
  const alternatives = rawAlternatives.map((a) => localizeSite(a, i18n.language));

  function levelLabel(percent: number) {
    if (percent < 40) return t("siteDetail.crowd.quiet");
    if (percent < 75) return t("siteDetail.crowd.moderate");
    return t("siteDetail.crowd.busy");
  }

  const [historyOpen, setHistoryOpen] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div>
      {/* Hero gallery with parallax */}
      <div ref={heroRef} className="relative h-[70vh] w-full overflow-hidden pt-20">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image src={site.image} alt={site.name} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <div className="absolute bottom-0 left-0 w-full px-6 pb-12 md:px-16">
          <span className="mb-3 block font-label text-xs uppercase tracking-widest text-accent">
            {t(categoryLabelKey(site.category))}
          </span>
          <h1 className="text-shadow-sm max-w-3xl font-headline text-4xl font-bold text-foreground md:text-6xl">
            {site.name}
          </h1>
          <p className="mt-3 flex items-center gap-1 font-body text-foreground-muted">
            <Icon name="location_on" className="text-sm" />
            {site.region}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-shell px-6 py-12 md:px-16">
        {/* Actions + crowd gauge */}
        <Reveal className="mb-12 flex flex-col items-start justify-between gap-8 border-b border-hairline pb-12 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <CrowdGaugeRadial percent={site.crowdPercent} size={80} />
            <div>
              <h2 className="font-headline text-xl text-foreground">{t("siteDetail.crowd.heading")}</h2>
              <p className="max-w-sm font-body text-sm text-foreground-muted">{levelLabel(site.crowdPercent)}</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <Link href={`/explore/map?site=${site.slug}`}>
              <Button variant="secondary" size="sm">
                <Icon name="map" className="text-sm" /> {t("siteDetail.viewOnMap")}
              </Button>
            </Link>
            <Link href="/guides/verify">
              <Button size="sm">
                <Icon name="person_search" className="text-sm" /> {t("siteDetail.findGuide")}
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Smart Alternatives strip */}
        {alternatives.length > 0 && (
          <Reveal className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline text-2xl text-foreground">{t("siteDetail.alternatives.heading")}</h2>
              <Link
                href="/alternatives"
                className="font-label text-xs uppercase tracking-widest text-foreground-muted hover:text-accent"
              >
                {t("siteDetail.alternatives.seeAll")}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {alternatives.map((alt) => (
                <Link key={alt.id} href={`/sites/${alt.slug}`}>
                  <Card className="flex items-center gap-4 p-4 transition-transform hover:-translate-y-1">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={alt.image} alt={alt.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h3 className="truncate font-headline text-base text-foreground">{alt.name}</h3>
                      <p className="font-body text-xs text-foreground-muted">
                        {t("siteDetail.alternatives.further", { km: Math.abs(alt.distanceKm - site.distanceKm).toFixed(1) })}
                      </p>
                    </div>
                    <CrowdGaugeRadial percent={alt.crowdPercent} size={44} showLabel={false} />
                  </Card>
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {/* History & Significance */}
        <Reveal>
          <button
            onClick={() => setHistoryOpen((o) => !o)}
            className="mb-4 flex w-full items-center justify-between border-b border-hairline pb-4"
          >
            <h2 className="font-headline text-2xl text-foreground">{t("siteDetail.history.heading")}</h2>
            <Icon name={historyOpen ? "remove" : "add"} />
          </button>
          {historyOpen && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <p className="font-body text-base leading-relaxed text-foreground-muted md:col-span-2">
                {site.history}
              </p>
              <div className="glass-panel rounded-xl p-6">
                <dl className="flex flex-col gap-4">
                  <div>
                    <dt className="font-label text-xs uppercase tracking-widest text-foreground-muted">
                      {t("siteDetail.entryFee")}
                    </dt>
                    <dd className="font-headline text-xl text-accent">₹{site.priceInr}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs uppercase tracking-widest text-foreground-muted">
                      {t("siteDetail.openHours")}
                    </dt>
                    <dd className="font-body text-sm text-foreground">{site.openHours}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
