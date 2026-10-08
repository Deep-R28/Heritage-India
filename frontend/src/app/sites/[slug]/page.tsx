import { notFound } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { SiteDetailView } from "@/components/sites/site-detail";
import { getSiteBySlug, getAlternativesFor, getSites } from "@/lib/data";

export async function generateStaticParams() {
  const sites = await getSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export default async function SiteDetailPage({ params }: { params: { slug: string } }) {
  const site = await getSiteBySlug(params.slug);
  if (!site) notFound();

  const alternatives = await getAlternativesFor(site.id);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-grow">
        <SiteDetailView site={site} alternatives={alternatives} />
      </main>
      <Footer />
    </div>
  );
}
