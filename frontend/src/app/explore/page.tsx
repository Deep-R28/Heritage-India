import { TopNav } from "@/components/layout/top-nav";
import { ExploreClient } from "@/components/explore/explore-client";
import { getSites } from "@/lib/data";

export default async function ExplorePage() {
  const sites = await getSites();
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="pt-20">
        <ExploreClient sites={sites} />
      </div>
    </div>
  );
}
