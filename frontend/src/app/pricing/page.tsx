import { SiteShell } from "@/components/layout/site-shell";
import { PricingView } from "@/components/pricing/pricing-view";
import { getPricing, getSites } from "@/lib/data";

export default async function PricingPage() {
  const [pricing, sites] = await Promise.all([getPricing(), getSites()]);

  return (
    <SiteShell mainClassName="pt-20">
      <PricingView pricing={pricing} sites={sites} />
    </SiteShell>
  );
}
