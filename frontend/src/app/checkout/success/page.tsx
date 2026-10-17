import { Suspense } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { PaymentSuccessView } from "@/components/checkout/payment-success-view";

export const metadata = {
  title: "Booking Confirmed | Heritage India",
  description: "Your heritage booking and certified guide reservation has been confirmed.",
};

export default function PaymentSuccessPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl px-6 py-20 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        }
      >
        <PaymentSuccessView />
      </Suspense>
    </SiteShell>
  );
}
