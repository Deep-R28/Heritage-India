import { Suspense } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = {
  title: "Checkout | Heritage India",
  description: "Secure concierge booking for India's heritage sites and licensed ASI guides.",
};

export default function CheckoutPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-content px-6 py-20 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        }
      >
        <CheckoutView />
      </Suspense>
    </SiteShell>
  );
}
