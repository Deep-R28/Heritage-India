import { SiteShell } from "@/components/layout/site-shell";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { getNotifications } from "@/lib/data";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <SiteShell mainClassName="pt-20">
      <NotificationsClient initial={notifications} />
    </SiteShell>
  );
}
