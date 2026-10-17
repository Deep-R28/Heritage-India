"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type ApiBooking } from "@/lib/api";

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "HI-2026-TAJ-001";
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.bookings.byReference(ref);
        setBooking(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ref]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 font-label text-xs uppercase tracking-widest text-foreground-muted">Retrieving Reservation...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center md:px-8">
      {/* Brand Gold Accent Success Motif */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent shadow-xl shadow-accent/10">
        <Icon name="verified" className="text-4xl text-accent" />
      </div>

      <p className="font-label text-xs uppercase tracking-widest text-accent">Reservation Confirmed</p>
      <h1 className="mt-2 font-headline text-3xl text-foreground md:text-4xl">Your Heritage Journey Awaits</h1>
      <p className="mt-2 font-body text-sm text-foreground-muted">
        Your payment was authorized successfully. Official access passes and guide concierge details have been dispatched.
      </p>

      {/* Booking Reference Card */}
      <Card className="mt-8 overflow-hidden p-6 text-left">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <span className="font-label text-[10px] uppercase tracking-wider text-foreground-muted">Reference ID</span>
            <p className="font-mono text-base font-semibold text-accent">{booking?.reference || ref}</p>
          </div>
          <Badge tone="verified">Payment Complete</Badge>
        </div>

        <div className="mt-4 space-y-3 font-body text-xs">
          <div className="flex justify-between">
            <span className="text-foreground-muted">Monument / Site</span>
            <span className="font-headline text-foreground">{booking?.site.name || "The Taj Mahal"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-foreground-muted">Destination</span>
            <span className="text-foreground">{booking?.site.city || "Agra, Uttar Pradesh"}</span>
          </div>

          {booking?.guide && (
            <div className="flex justify-between">
              <span className="text-foreground-muted">Certified Guide</span>
              <span className="text-accent">{booking.guide.name} (ASI Licensed)</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-foreground-muted">Visit Schedule</span>
            <span className="text-foreground">
              {booking?.visitDate
                ? new Date(booking.visitDate).toLocaleDateString("en-IN", { dateStyle: "full" })
                : "Upcoming Date"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-foreground-muted">Party Size</span>
            <span className="text-foreground">{booking?.partySize || 2} Visitors</span>
          </div>

          <div className="flex justify-between border-t border-hairline pt-3 font-semibold">
            <span className="text-foreground">Amount Paid</span>
            <span className="font-mono text-sm text-accent">
              ₹{(booking?.totalINR || 4000).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-surface-hover/40 p-3 text-center text-xs text-foreground-muted">
          <p>Confirmation email & digital gate passes sent to your registered email.</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/trips"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-label text-xs uppercase tracking-widest text-background hover:bg-accent/90"
        >
          <Icon name="luggage" className="text-base" />
          Add to My Trips
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-6 py-3 font-label text-xs uppercase tracking-widest text-foreground hover:bg-surface-hover"
        >
          <Icon name="download" className="text-base" />
          Download Receipt
        </button>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-6 py-3 font-label text-xs uppercase tracking-widest text-foreground hover:bg-surface-hover"
        >
          Explore More Sites
        </Link>
      </div>
    </div>
  );
}
