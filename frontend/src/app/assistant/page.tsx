import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { ModeHubClient } from "@/components/assistant/mode-hub-client";

export default function AssistantModeHubPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <ModeHubClient />
      <Footer />
    </div>
  );
}
