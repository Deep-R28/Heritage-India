import { cookies } from "next/headers";
import { TopNav } from "@/components/layout/top-nav";
import { ExploreClient } from "@/components/explore/explore-client";
import { getSites } from "@/lib/data";
import { LANGUAGE_STORAGE_KEY, defaultLanguage } from "@/i18n/config";
import { localizeSite } from "@/lib/localize";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { site?: string };
}) {
  const cookieLang = cookies().get(LANGUAGE_STORAGE_KEY)?.value || defaultLanguage;
  const rawSites = await getSites();
  const sites = rawSites.map((s) => localizeSite(s, cookieLang));

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="pt-20">
        <ExploreClient sites={sites} initialSiteSlug={searchParams?.site} />
      </div>
    </div>
  );
}
