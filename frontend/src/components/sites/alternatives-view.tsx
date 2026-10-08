"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { Site } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrowdGaugeRadial } from "@/components/ui/crowd-gauge";
import { Reveal } from "@/components/ui/reveal";
import { localizeSite } from "@/lib/localize";

export function AlternativesView({ busySite: rawBusySite, alternatives: rawAlternatives }: { busySite?: Site; alternatives: Site[] }) {
  const { t, i18n } = useTranslation();
  const busySite = rawBusySite ? localizeSite(rawBusySite, i18n.language) : undefined;
  const alternatives = rawAlternatives.map((a) => localizeSite(a, i18n.language));

  return (
    <div className="mx-auto max-w-shell px-6 py-24 md:px-16">
      <Reveal className="mb-16 text-center">
        <span className="mb-4 block font-label text-xs uppercase tracking-widest text-error">
          {busySite ? t("alternatives.busyBadge", { site: busySite.name }) : t("alternatives.busyBadgeGeneric")}
        </span>
        <h1 className="mx-auto max-w-2xl font-headline text-3xl text-foreground md:text-5xl">
          {t("alternatives.heading")}
        </h1>
      </Reveal>

      {busySite && (
        <Reveal className="mb-12 flex items-center justify-center gap-4">
          <Card className="flex items-center gap-3 px-5 py-3">
            <CrowdGaugeRadial percent={busySite.crowdPercent} size={40} showLabel={false} />
            <span className="font-body text-sm text-foreground-muted">{busySite.name}</span>
          </Card>
          <Icon name="arrow_forward" className="text-accent" />
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {alternatives.map((alt, i) => (
          <Reveal key={alt.id} delay={i * 0.1}>
            <Card className="overflow-hidden">
              <div className="relative h-56 w-full">
                <Image src={alt.image} alt={alt.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-headline text-2xl text-foreground">{alt.name}</h2>
                    <p className="mt-1 flex items-center gap-1 font-body text-sm text-foreground-muted">
                      <Icon name="location_on" className="text-sm" />
                      {alt.region}
                    </p>
                  </div>
                  <CrowdGaugeRadial percent={alt.crowdPercent} size={56} showLabel={false} />
                </div>
                {busySite && (
                  <p className="mb-6 font-body text-sm text-foreground-muted">
                    {t(
                      alt.distanceKm > busySite.distanceKm ? "alternatives.distanceFurther" : "alternatives.distanceCloser",
                      { km: Math.abs(alt.distanceKm - busySite.distanceKm).toFixed(1), site: busySite.name },
                    )}
                  </p>
                )}
                <Link href={`/sites/${alt.slug}`}>
                  <Button className="w-full">{t("alternatives.switchCta")}</Button>
                </Link>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
