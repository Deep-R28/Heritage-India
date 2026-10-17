import { SiteShell } from "@/components/layout/site-shell";
import { TripsView } from "@/components/trips/trips-view";

export const metadata = {
  title: "My Trips | Heritage India",
  description: "View and manage your past and upcoming heritage bookings and guide reservations.",
};

export default function MyTripsPage() {
  return (
    <SiteShell>
      <TripsView />
    </SiteShell>
  );
}
