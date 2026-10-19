import type { Site, Guide } from "@/lib/data";
import type { PricingData } from "@/components/pricing/pricing-types";
import type { LanguageCode } from "@/i18n/config";
import { SITE_TRANSLATIONS } from "./site-translations";

function langCode(lang: string): LanguageCode {
  return (lang?.slice(0, 2) as LanguageCode) ?? "en";
}

export function localizeSiteName(slugOrName: string, lang: string): string {
  const code = langCode(lang);
  if (!slugOrName || code === "en") return slugOrName;

  // 1. Exact match by slug
  if (SITE_TRANSLATIONS[slugOrName]?.[code]?.name) {
    return SITE_TRANSLATIONS[slugOrName][code]!.name;
  }

  // 2. Slugified match (lowercase, spaces to hyphens)
  const normalizedSlug = slugOrName.trim().toLowerCase().replace(/\s+/g, "-");
  if (SITE_TRANSLATIONS[normalizedSlug]?.[code]?.name) {
    return SITE_TRANSLATIONS[normalizedSlug][code]!.name;
  }

  // 3. Normalized alphanumeric match
  const cleanTarget = slugOrName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [slug, transMap] of Object.entries(SITE_TRANSLATIONS)) {
    const cleanSlug = slug.replace(/[^a-z0-9]/g, "");
    if (cleanSlug === cleanTarget) {
      if (transMap[code]?.name) return transMap[code]!.name;
    }
  }

  return slugOrName;
}

export function localizeSite(site: Site, lang: string): Site {
  const code = langCode(lang);
  if (code === "en") return site;

  const siteTr =
    SITE_TRANSLATIONS[site.slug]?.[code] ||
    SITE_TRANSLATIONS[site.name?.toLowerCase().replace(/\s+/g, "-")]?.[code];
  const t = (site.translations as Record<string, { summary?: string; history?: string } | undefined>)?.[code];

  return {
    ...site,
    name: siteTr?.name ?? site.name,
    region: siteTr?.region ?? site.region,
    summary: siteTr?.summary ?? t?.summary ?? site.summary,
    history: siteTr?.history ?? t?.history ?? site.history,
  };
}

export function localizeGuide(guide: Guide, lang: string): Guide {
  const code = langCode(lang);
  if (code === "en") return guide;
  const t = (guide.translations as Record<string, { specialty?: string } | undefined>)?.[code];
  if (!t?.specialty) return guide;
  return { ...guide, specialty: t.specialty };
}

export function localizePricing(pricing: PricingData, lang: string): PricingData {
  const code = langCode(lang);
  if (code === "en") return pricing;
  const t = (pricing.translations as Record<string, { feeBreakdownNote?: string; guideRateTiers?: string[] } | undefined>)?.[code];
  if (!t) return pricing;
  return {
    ...pricing,
    feeBreakdownNote: t.feeBreakdownNote ?? pricing.feeBreakdownNote,
    guideRates: t.guideRateTiers
      ? pricing.guideRates.map((rate, i) => ({ ...rate, tier: t.guideRateTiers?.[i] ?? rate.tier }))
      : pricing.guideRates,
  };
}

