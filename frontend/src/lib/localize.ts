/**
 * Localizes mock content-data fields (site descriptions, guide specialties,
 * pricing copy) client-side by active i18n language. Proper nouns — site
 * names, guide names, regions, spoken-language lists — stay in their
 * canonical English form on purpose; only descriptive prose is translated.
 *
 * Pages fetch this data server-side (before the client's language preference
 * is known), so every translation variant ships to the client and the right
 * one is picked here at render time instead of on the server.
 */
import type { Site, Guide } from "@/lib/data";
import type { PricingData } from "@/components/pricing/pricing-types";
import type { LanguageCode } from "@/i18n/config";

function langCode(lang: string): LanguageCode {
  return (lang?.slice(0, 2) as LanguageCode) ?? "en";
}

export function localizeSite(site: Site, lang: string): Site {
  const code = langCode(lang);
  if (code === "en") return site;
  const t = site.translations?.[code];
  if (!t) return site;
  return { ...site, summary: t.summary ?? site.summary, history: t.history ?? site.history };
}

export function localizeGuide(guide: Guide, lang: string): Guide {
  const code = langCode(lang);
  if (code === "en") return guide;
  const t = guide.translations?.[code];
  if (!t?.specialty) return guide;
  return { ...guide, specialty: t.specialty };
}

export function localizePricing(pricing: PricingData, lang: string): PricingData {
  const code = langCode(lang);
  if (code === "en") return pricing;
  const t = pricing.translations?.[code];
  if (!t) return pricing;
  return {
    ...pricing,
    feeBreakdownNote: t.feeBreakdownNote ?? pricing.feeBreakdownNote,
    guideRates: t.guideRateTiers
      ? pricing.guideRates.map((rate, i) => ({ ...rate, tier: t.guideRateTiers?.[i] ?? rate.tier }))
      : pricing.guideRates,
  };
}
