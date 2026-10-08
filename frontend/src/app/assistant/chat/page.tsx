import { TopNav } from "@/components/layout/top-nav";
import { ChatClient } from "@/components/assistant/chat-client";

export default function ChatAssistantPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="pt-20">
        <ChatClient />
      </div>
    </div>
  );
}
