import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { SiteDetailView } from "@/components/sites/site-detail";
import { getSiteBySlug, getAlternativesFor, getSites } from "@/lib/data";
import { LANGUAGE_STORAGE_KEY, defaultLanguage } from "@/i18n/config";
import { localizeSite } from "@/lib/localize";

export async function generateStaticParams() {
  const sites = await getSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export default async function SiteDetailPage({ params }: { params: { slug: string } }) {
  const cookieLang = cookies().get(LANGUAGE_STORAGE_KEY)?.value || defaultLanguage;
  const rawSite = await getSiteBySlug(params.slug);
  if (!rawSite) notFound();

  const rawAlternatives = await getAlternativesFor(rawSite.id);
  const site = localizeSite(rawSite, cookieLang);
  const alternatives = rawAlternatives.map((a) => localizeSite(a, cookieLang));

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
