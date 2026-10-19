import { cookies } from "next/headers";
import { SiteShell } from "@/components/layout/site-shell";
import { PricingView } from "@/components/pricing/pricing-view";
import { getPricing, getSites } from "@/lib/data";
import { LANGUAGE_STORAGE_KEY, defaultLanguage } from "@/i18n/config";
import { localizeSite, localizePricing } from "@/lib/localize";

export default async function PricingPage() {
  const cookieLang = cookies().get(LANGUAGE_STORAGE_KEY)?.value || defaultLanguage;
  const [rawPricing, rawSites] = await Promise.all([getPricing(), getSites()]);
  const pricing = localizePricing(rawPricing, cookieLang);
  const sites = rawSites.map((s) => localizeSite(s, cookieLang));

  return (
    <SiteShell mainClassName="pt-20">
      <PricingView pricing={pricing} sites={sites} />
    </SiteShell>
  );
}
