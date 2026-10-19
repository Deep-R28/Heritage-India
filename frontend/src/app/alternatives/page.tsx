import { cookies } from "next/headers";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AlternativesView } from "@/components/sites/alternatives-view";
import { getSiteBySlug, getAlternativesFor, getSites } from "@/lib/data";
import { LANGUAGE_STORAGE_KEY, defaultLanguage } from "@/i18n/config";
import { localizeSite } from "@/lib/localize";

export default async function AlternativesPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const cookieLang = cookies().get(LANGUAGE_STORAGE_KEY)?.value || defaultLanguage;
  const sites = await getSites();
  const rawBusySite = searchParams.from
    ? await getSiteBySlug(searchParams.from)
    : sites.slice().sort((a, b) => b.crowdPercent - a.crowdPercent)[0];

  const rawAlternatives = rawBusySite ? await getAlternativesFor(rawBusySite.id, 4) : sites.slice(0, 4);
  const busySite = rawBusySite ? localizeSite(rawBusySite, cookieLang) : undefined;
  const alternatives = rawAlternatives.map((a) => localizeSite(a, cookieLang));

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-grow pt-20">
        <AlternativesView busySite={busySite} alternatives={alternatives} />
      </main>
      <Footer />
    </div>
  );
}
