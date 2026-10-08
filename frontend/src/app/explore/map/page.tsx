import { TopNav } from "@/components/layout/top-nav";
import { MapSelectorClient } from "@/components/map/map-selector-client";
import { getSites } from "@/lib/data";

export default async function MapSelectorPage() {
  const sites = await getSites();
  return (
    <div className="relative min-h-screen">
      <TopNav />
      <MapSelectorClient sites={sites} />
    </div>
  );
}
