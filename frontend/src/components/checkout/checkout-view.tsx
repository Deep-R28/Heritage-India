"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type ApiSite, type ApiGuide } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const siteSlug = searchParams.get("site") || "taj-mahal";
  const guideId = searchParams.get("guide");
  const initialDate = searchParams.get("date") || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];

  const [site, setSite] = useState<ApiSite | null>(null);
  const [guide, setGuide] = useState<ApiGuide | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [visitDate, setVisitDate] = useState(initialDate);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI">("UPI");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("09/28");
  const [cardCvc, setCardCvc] = useState("321");
  const [cardName, setCardName] = useState(user?.name || "Deep Raja");
  const [upiId, setUpiId] = useState("explorer@okhdfcbank");

  useEffect(() => {
    async function loadData() {
      try {
        const siteData = await api.sites.bySlug(siteSlug);
        setSite(siteData);

        if (guideId) {
          const guideRes = await api.guides.verify(guideId);
          if (guideRes.guide) setGuide(guideRes.guide);
        } else {
          // Pick a default verified guide
          const guidesRes = await api.guides.verify();
          if (guidesRes.guides && guidesRes.guides.length > 0) {
            setGuide(guidesRes.guides[0]);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load checkout details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [siteSlug, guideId]);

  // Pricing calculations
  const entryFeePerPerson = site?.entryFeeINR ?? 1100;
  const siteEntryTotal = entryFeePerPerson * partySize;
  const guideFeeTotal = guide ? guide.ratePerHourINR * 3 : 0;
  const subtotal = siteEntryTotal + guideFeeTotal;
  const conciergeFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + conciergeFee + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!site) throw new Error("Site not loaded");

      // 1. Create booking
      const booking = await api.bookings.create({
        siteId: site.id,
        guideId: guide?.id ?? null,
        visitDate,
        partySize,
        userId: user?.id,
      });

      // 2. Process payment
      const paymentRes = await api.payments.process({
        bookingId: booking.id,
        method: paymentMethod,
        details:
          paymentMethod === "CARD"
            ? { cardNumber, cardExpiry, cardCvc, cardName }
            : { upiId },
      });

      if (!paymentRes.success) {
        throw new Error("Payment was declined. Please verify your details.");
      }

      // 3. Navigate to success page
      router.push(`/checkout/success?ref=${booking.reference}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected payment error occurred";
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 font-label text-xs uppercase tracking-widest text-foreground-muted">Securing Concierge Channel...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:px-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href={`/sites/${siteSlug}`} className="font-label text-xs uppercase tracking-widest text-accent hover:underline">
          ← Return to {site?.name || "Monument"}
        </Link>
        <h1 className="mt-2 font-headline text-3xl text-foreground md:text-4xl">Secure Concierge Checkout</h1>
        <p className="mt-1 font-body text-sm text-foreground-muted">
          Transparent pricing backed by verified ASI licensing and official monuments entry.
        </p>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <Icon name="error" className="text-xl shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5">
          <Card className="sticky top-24 overflow-hidden p-6">
            <h2 className="border-b border-hairline pb-4 font-headline text-xl text-foreground">Trip Summary</h2>

            {site && (
              <div className="mt-6 flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  {site.images[0] && (
                    <Image src={site.images[0]} alt={site.name} fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div>
                  <h3 className="font-headline text-lg text-foreground">{site.name}</h3>
                  <p className="font-body text-xs text-foreground-muted">{site.city}, {site.state}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-accent">₹{entryFeePerPerson}/person</span>
                    <Badge tone="verified">Official Ticket</Badge>
                  </div>
                </div>
              </div>
            )}

            {guide && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-hairline bg-surface-hover/30 p-3">
                <div className="flex items-center gap-2.5">
                  <Icon name="verified_user" className="text-lg text-accent" />
                  <div>
                    <p className="font-headline text-xs text-foreground">{guide.name}</p>
                    <p className="font-body text-[10px] text-foreground-muted">ASI Licensed ({guide.licenseId})</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-foreground">₹{guide.ratePerHourINR * 3}</span>
              </div>
            )}

            {/* Config: Date & Party Size */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-4">
              <div>
                <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="mt-1 w-full rounded border border-hairline bg-surface px-2.5 py-1.5 font-mono text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">Party Size</label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-hairline bg-surface px-2.5 py-1.5 font-body text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Visitor" : "Visitors"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Itemized Fee Breakdown */}
            <div className="mt-6 space-y-2.5 border-t border-hairline pt-4 font-body text-xs text-foreground-muted">
              <div className="flex justify-between">
                <span>Monument Entry ({partySize} tickets)</span>
                <span className="font-mono text-foreground">₹{siteEntryTotal.toLocaleString("en-IN")}</span>
              </div>
              {guide && (
                <div className="flex justify-between">
                  <span>Certified Guide (3 hours)</span>
                  <span className="font-mono text-foreground">₹{guideFeeTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Concierge & Safety Support</span>
                <span className="font-mono text-foreground">₹{conciergeFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Government Taxes (GST 5%)</span>
                <span className="font-mono text-foreground">₹{taxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-3 font-headline text-base text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-accent">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Anti-Scam Assurance */}
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-foreground-muted">
              <div className="flex items-center gap-1.5 font-label uppercase text-accent">
                <Icon name="shield" className="text-sm" />
                Anti-Scam Guarantee
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                Zero surge pricing, direct ASI guide honorarium, and full refund protection if plans change.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-7">
          <Card className="p-8">
            <h2 className="font-headline text-xl text-foreground">Payment Method</h2>
            <p className="mt-1 font-body text-xs text-foreground-muted">
              Select your preferred secure transaction method (Test Mode).
            </p>

            {/* Tabs */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 font-label text-xs uppercase tracking-wider transition-all ${
                  paymentMethod === "UPI"
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-hairline bg-surface text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon name="qr_code_2" className="text-lg" />
                UPI / QR Instant
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 font-label text-xs uppercase tracking-wider transition-all ${
                  paymentMethod === "CARD"
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-hairline bg-surface text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon name="credit_card" className="text-lg" />
                Credit / Debit Card
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {paymentMethod === "UPI" ? (
                <div className="space-y-4 rounded-xl border border-hairline bg-surface-hover/20 p-6">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">
                      UPI Virtual Payment Address (VPA)
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        required
                        className="w-full rounded-lg border border-hairline bg-surface px-4 py-2.5 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 font-mono text-xs text-accent">BHIM UPI</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-xs text-foreground-muted">
                    <Icon name="security" className="text-base text-verified" />
                    <span>Instant authorization via Google Pay, PhonePe, Paytm, or CRED</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-hairline bg-surface-hover/20 p-6">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="mt-2 w-full rounded-lg border border-hairline bg-surface px-4 py-2.5 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="mt-2 w-full rounded-lg border border-hairline bg-surface px-4 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        className="mt-2 w-full rounded-lg border border-hairline bg-surface px-4 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        required
                        className="mt-2 w-full rounded-lg border border-hairline bg-surface px-4 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust & Security Badge Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <Icon name="lock" className="text-base text-accent" />
                  <span>256-Bit TLS End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" className="text-base text-verified" />
                  <span>PCI-DSS Level 1 Compliant</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 font-label text-sm uppercase tracking-widest text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                <Icon name="lock" className="text-base" />
                {submitting ? "Processing Reservation..." : `Pay ₹${grandTotal.toLocaleString("en-IN")} Securely`}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
