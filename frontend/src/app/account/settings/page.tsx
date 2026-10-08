import { SiteShell } from "@/components/layout/site-shell";
import { SettingsView } from "@/components/account/settings-view";

export default function SettingsPage() {
  return (
    <SiteShell mainClassName="pt-20">
      <SettingsView />
    </SiteShell>
  );
}
