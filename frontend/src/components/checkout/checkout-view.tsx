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
  const initialDate = searchParams.get("date") || new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const paramParty = searchParams.get("partySize") || searchParams.get("members") || searchParams.get("tickets");
  const initialParty = paramParty ? Math.max(1, parseInt(paramParty, 10)) : 2;
  const initialSlot = searchParams.get("slot") || "09:00 AM (Morning Slot)";

  const [site, setSite] = useState<ApiSite | null>(null);
  const [guide, setGuide] = useState<ApiGuide | null>(null);
  const [availableGuides, setAvailableGuides] = useState<ApiGuide[]>([]);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideLanguageFilter, setGuideLanguageFilter] = useState("All");
  const [guideSearchQuery, setGuideSearchQuery] = useState("");

  const [partySize, setPartySize] = useState(initialParty);
  const [visitDate, setVisitDate] = useState(initialDate);
  const [visitSlot, setVisitSlot] = useState(initialSlot);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI">("UPI");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

        const guidesRes = await api.guides.verify();
        if (guidesRes.guides && guidesRes.guides.length > 0) {
          setAvailableGuides(guidesRes.guides);
          if (guideId === "none" || guideId === "self") {
            setGuide(null);
          } else if (guideId) {
            const matched = guidesRes.guides.find(
              (g) =>
                g.id === guideId ||
                g.licenseId?.toLowerCase() === guideId.toLowerCase() ||
                g.name.toLowerCase().includes(guideId.toLowerCase())
            );
            if (matched) setGuide(matched);
            else setGuide(guidesRes.guides[0]);
          } else {
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

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!site) return;
    setError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmAndPay = async () => {
    setShowConfirmModal(false);
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

  const filteredGuides = availableGuides.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
      g.languages.some((l) => l.toLowerCase().includes(guideSearchQuery.toLowerCase())) ||
      (g.licenseId && g.licenseId.toLowerCase().includes(guideSearchQuery.toLowerCase()));

    const matchesLang =
      guideLanguageFilter === "All" ||
      g.languages.some((l) => l.toLowerCase().includes(guideLanguageFilter.toLowerCase()));

    return matchesSearch && matchesLang;
  });

  const allGuideLanguages = [
    "All",
    "English",
    "Hindi",
    "Spanish",
    "Tamil",
    "Urdu",
    "French",
    "German",
    "Bengali",
    "Punjabi",
    "Telugu",
    "Marathi",
  ];

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

            {/* Guide Selection Status Card */}
            <div className="mt-6 border-t border-hairline pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">
                  Official Guide Service
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="font-label text-xs uppercase tracking-wider text-accent hover:underline"
                >
                  {guide ? "Change Guide" : "+ Add Guide"}
                </button>
              </div>

              {guide ? (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                        <Icon name="verified_user" className="text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-headline text-sm font-semibold text-foreground">{guide.name}</p>
                          <Badge tone="verified">ASI Verified</Badge>
                        </div>
                        <p className="mt-0.5 font-label text-[10px] uppercase text-foreground-muted">
                          License: {guide.licenseId} &middot; {guide.experienceYears} yrs exp
                        </p>
                        <p className="mt-1 font-body text-xs text-accent">
                          Languages: {guide.languages.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-foreground">₹{guide.ratePerHourINR * 3}</span>
                      <p className="text-[10px] text-foreground-muted">3 hrs tour</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-end gap-3 border-t border-hairline/60 pt-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGuide(null)}
                      className="text-foreground-muted hover:text-red-400"
                    >
                      Remove (Entry Only)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(true)}
                      className="font-semibold text-accent hover:underline"
                    >
                      Choose Different Guide →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-hairline border-dashed bg-surface/50 p-3.5">
                  <div>
                    <p className="font-headline text-xs text-foreground">No Guide Selected</p>
                    <p className="text-[11px] text-foreground-muted">Entry tickets only. You can add a certified ASI guide anytime.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="shrink-0 rounded bg-accent px-3 py-1.5 font-label text-xs font-semibold uppercase text-background hover:bg-accent/90"
                  >
                    Select Guide
                  </button>
                </div>
              )}
            </div>

            {/* Config: Date, Time Slot & Party Size */}
            <div className="mt-6 space-y-4 border-t border-hairline pt-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">Entry Time Slot</label>
                <select
                  value={visitSlot}
                  onChange={(e) => setVisitSlot(e.target.value)}
                  className="mt-1 w-full rounded border border-hairline bg-surface px-2.5 py-1.5 font-body text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="06:00 AM - 09:00 AM (Sunrise Slot)">🌅 06:00 AM – 09:00 AM (Sunrise Slot — Best Light & Lowest Crowd)</option>
                  <option value="09:00 AM - 12:00 PM (Morning Slot)">☀️ 09:00 AM – 12:00 PM (Morning Slot)</option>
                  <option value="12:00 PM - 03:00 PM (Afternoon Slot)">🌤️ 12:00 PM – 03:00 PM (Afternoon Slot)</option>
                  <option value="03:00 PM - 06:00 PM (Sunset Slot)">🌇 03:00 PM – 06:00 PM (Sunset Slot — Golden Hour)</option>
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
                  <span>Certified ASI Guide ({guide.name}, 3 hrs)</span>
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

            {/* Payment Method Switcher */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-label text-xs uppercase tracking-wider transition-all ${
                  paymentMethod === "UPI"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-hairline bg-surface text-foreground-muted hover:bg-surface-hover"
                }`}
              >
                <Icon name="qr_code_2" className="text-lg" />
                UPI / QR Instant
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-label text-xs uppercase tracking-wider transition-all ${
                  paymentMethod === "CARD"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-hairline bg-surface text-foreground-muted hover:bg-surface-hover"
                }`}
              >
                <Icon name="credit_card" className="text-lg" />
                Credit / Debit Card
              </button>
            </div>

            <form onSubmit={handleOpenConfirmation} className="mt-8 space-y-5">
              {paymentMethod === "UPI" ? (
                <div className="space-y-4 rounded-xl border border-hairline bg-surface-hover/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon name="mobile_friendly" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-headline text-sm text-foreground">Instant UPI Payment</h3>
                      <p className="font-body text-xs text-foreground-muted">
                        Pay securely using Google Pay, PhonePe, Paytm, or BHIM.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      required
                      className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-label text-[10px] uppercase tracking-wider text-foreground-muted">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        required
                        maxLength={4}
                        className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Trust Badges */}
              <div className="flex items-center justify-between border-t border-hairline pt-4 font-body text-xs text-foreground-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="lock" className="text-sm text-accent" /> 256-Bit TLS End-to-End Encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="verified" className="text-sm text-accent" /> PCI-DSS Level 1 Compliant
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-label text-sm font-semibold uppercase tracking-widest text-obsidian shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                    <span>Processing Secure Reservation...</span>
                  </>
                ) : (
                  <>
                    <Icon name="lock" className="text-base" />
                    <span>Pay ₹{grandTotal.toLocaleString("en-IN")} Securely</span>
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Ticket & Payment Confirmation Screen (Yes/No Modal) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/30">
                  <Icon name="verified" className="text-xs" /> Confirmation Required
                </span>
                <h3 className="mt-2 font-headline text-xl text-foreground md:text-2xl">
                  Confirm Ticket Booking & Payment
                </h3>
                <p className="mt-1 font-body text-xs text-foreground-muted">
                  Please review your reservation summary before authorizing payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {/* Summary Details */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
              <div className="rounded-xl border border-hairline bg-surface-elevated/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                  <span className="font-label uppercase text-foreground-muted">Heritage Monument</span>
                  <span className="font-headline font-semibold text-foreground text-right">{site?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                  <span className="font-label uppercase text-foreground-muted">Date & Time Slot</span>
                  <span className="font-mono text-foreground text-right">{visitDate} &middot; {visitSlot.split(" ")[0]}</span>
                </div>
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                  <span className="font-label uppercase text-foreground-muted">Visitors</span>
                  <span className="font-mono text-foreground text-right">{partySize} Member{partySize > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                  <span className="font-label uppercase text-foreground-muted">Guide Service</span>
                  <span className="font-mono text-foreground text-right">
                    {guide ? `${guide.name} (₹${guideFeeTotal})` : "Self-Guided (No Guide)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label uppercase text-foreground-muted">Payment Mode</span>
                  <span className="font-mono text-accent text-right">
                    {paymentMethod === "UPI" ? `UPI (${upiId})` : `Card (${cardNumber.slice(-4)})`}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-foreground-muted">
                  <span>Entry Tickets ({partySize} × ₹{entryFeePerPerson})</span>
                  <span>₹{siteEntryTotal.toLocaleString("en-IN")}</span>
                </div>
                {guide && (
                  <div className="flex justify-between text-foreground-muted">
                    <span>Guide Fee (3 hrs)</span>
                    <span>₹{guideFeeTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground-muted">
                  <span>Concierge & Platform Fee (10%)</span>
                  <span>₹{conciergeFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-foreground-muted">
                  <span>GST & Taxes (5%)</span>
                  <span>₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-accent/30 pt-2 font-headline text-sm font-bold text-accent">
                  <span className="font-label uppercase tracking-wider">Total Payable</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="rounded-lg border border-hairline bg-surface-elevated/30 p-2.5 text-center text-[11px] text-foreground-muted">
                Are you ready to confirm this reservation and initiate payment of <strong className="text-foreground">₹{grandTotal.toLocaleString("en-IN")}</strong>?
              </div>
            </div>

            {/* Action Buttons: Yes/No */}
            <div className="flex items-center gap-3 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg border border-hairline py-2.5 font-label text-xs font-semibold uppercase tracking-wider text-foreground-muted transition-all hover:bg-surface-elevated hover:text-foreground cursor-pointer text-center"
              >
                No, Review Details
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={submitting}
                className="flex-1 rounded-lg bg-accent py-2.5 font-label text-xs font-semibold uppercase tracking-wider text-obsidian shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Icon name="check_circle" className="text-sm" />
                Yes, Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Guide Selection Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="glass-panel flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-hairline shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <div>
                <h3 className="font-headline text-xl text-foreground">Choose Your Certified ASI Guide</h3>
                <p className="font-body text-xs text-foreground-muted">
                  Select an official historian fluent in your preferred language and historical interest.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-full p-2 text-foreground-muted hover:bg-surface hover:text-accent"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-3 border-b border-hairline bg-surface/40 p-4">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted" />
                <input
                  type="text"
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  placeholder="Search by guide name, license ID, or language..."
                  className="w-full rounded-lg border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
              </div>

              {/* Language Chips */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
                {allGuideLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setGuideLanguageFilter(lang)}
                    className={`rounded-full px-2.5 py-1 font-label text-[11px] uppercase tracking-wider transition-all ${
                      guideLanguageFilter === lang
                        ? "bg-accent text-background font-bold shadow-sm"
                        : "border border-hairline bg-surface text-foreground-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {/* Option to visit without guide */}
              <div
                onClick={() => {
                  setGuide(null);
                  setShowGuideModal(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all hover:border-accent/50 ${
                  guide === null
                    ? "border-accent bg-accent/10"
                    : "border-hairline bg-surface/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-foreground-muted">
                      <Icon name="person_off" className="text-lg" />
                    </div>
                    <div>
                      <h4 className="font-headline text-sm font-semibold text-foreground">Self-Guided Exploration (No Guide)</h4>
                      <p className="text-xs text-foreground-muted">Book monument admission tickets only without guide services.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-400">₹0 (Entry Only)</span>
                </div>
              </div>

              {filteredGuides.map((g) => {
                const isSelected = guide?.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setGuide(g);
                      setShowGuideModal(false);
                    }}
                    className={`cursor-pointer rounded-xl border p-4 transition-all hover:border-accent/60 ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-hairline bg-surface/50 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/15 text-accent font-headline font-bold text-base">
                          {g.name.split(" ").map((w) => w[0]).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline text-base font-semibold text-foreground">{g.name}</h4>
                            <Badge tone={g.licenseStatus === "VERIFIED" ? "verified" : "warning"}>
                              {g.licenseStatus === "VERIFIED" ? "ASI Certified" : "Unverified"}
                            </Badge>
                          </div>
                          <p className="font-label text-xs text-foreground-muted">
                            License: {g.licenseId} &middot; {g.experienceYears} Years Experience
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {g.languages.map((l) => (
                              <span
                                key={l}
                                className="rounded bg-surface-container px-2 py-0.5 font-label text-[10px] text-accent border border-hairline"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-base font-bold text-accent">₹{g.ratePerHourINR}/hr</div>
                        <p className="text-[10px] text-foreground-muted">₹{g.ratePerHourINR * 3} for 3 hrs</p>
                        <button
                          type="button"
                          className={`mt-2 rounded px-3 py-1 font-label text-xs font-semibold uppercase ${
                            isSelected
                              ? "bg-accent text-background"
                              : "border border-hairline bg-surface text-foreground hover:border-accent"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-hairline bg-surface/60 px-6 py-3 text-xs text-foreground-muted">
              <span>All ASI guides undergo background security and archival history testing.</span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="font-label uppercase tracking-wider text-accent hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
