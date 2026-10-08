import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AlternativesView } from "@/components/sites/alternatives-view";
import { getSiteBySlug, getAlternativesFor, getSites } from "@/lib/data";

export default async function AlternativesPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const sites = await getSites();
  const busySite = searchParams.from
    ? await getSiteBySlug(searchParams.from)
    : sites.slice().sort((a, b) => b.crowdPercent - a.crowdPercent)[0];

  const alternatives = busySite ? await getAlternativesFor(busySite.id, 4) : sites.slice(0, 4);

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
