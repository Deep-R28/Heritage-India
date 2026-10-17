import { SiteShell } from "@/components/layout/site-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard | Heritage India",
  description: "Your personalized travel hub, upcoming bookings, and saved heritage sites.",
};

export default function DashboardPage() {
  return (
    <SiteShell>
      <DashboardView />
    </SiteShell>
  );
}
