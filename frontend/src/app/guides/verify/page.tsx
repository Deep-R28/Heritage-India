import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { GuideVerificationClient } from "@/components/guides/guide-verification-client";
import { getGuides, getPricing } from "@/lib/data";

export default async function GuideVerificationPage() {
  const [guides, pricing] = await Promise.all([getGuides(), getPricing()]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-grow pt-20">
        <GuideVerificationClient guides={guides} pricing={pricing} />
      </main>
      <Footer />
    </div>
  );
}
