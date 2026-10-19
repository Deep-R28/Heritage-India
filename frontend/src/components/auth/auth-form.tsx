"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const HERO_IMAGE = "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  const redirectParam = searchParams.get("redirect");
  const fromCheckout = searchParams.get("from") === "checkout";
  const siteNameParam = searchParams.get("siteName");

  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const fullname = (formData.get("fullname") as string)?.trim() || "Explorer";

    try {
      if (isSignup) {
        await signup({ name: fullname, email, password });
      } else {
        await login({ email, password });
      }

      if (redirectParam) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pending_booking_draft");
        }
        router.push(redirectParam);
        return;
      }

      // Check if there is a pending booking draft to auto-finalize
      if (typeof window !== "undefined") {
        const rawDraft = sessionStorage.getItem("pending_booking_draft");
        if (rawDraft) {
          try {
            const draft = JSON.parse(rawDraft);
            const booking = await api.bookings.create({
              siteId: draft.siteId,
              guideId: draft.guideId,
              guideName: draft.guideName,
              visitDate: draft.visitDate,
              visitSlot: draft.visitSlot,
              time: draft.visitSlot,
              partySize: draft.partySize,
              leadVisitor: draft.leadVisitor,
              amountPaid: draft.totalINR,
            });
            sessionStorage.removeItem("pending_booking_draft");
            router.push(`/checkout/success?ref=${booking.reference}&fromAuth=true`);
            return;
          } catch (autoErr) {
            console.warn("Auto-booking after auth failed:", autoErr);
          }
        }
      }

      if (isSignup) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please check your credentials.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
      {/* Left: cinematic image */}
      <div className="relative h-1/3 w-full shrink-0 overflow-hidden md:h-full md:w-1/2">
        <div
          className="absolute inset-0 h-full w-full scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 md:bg-gradient-to-r md:to-background/80" />
        <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between p-8">
          <Link href="/" className="font-headline text-2xl font-bold tracking-wide text-accent drop-shadow-md">
            Heritage India
          </Link>
        </div>
        <div className="absolute bottom-12 left-8 z-10 hidden max-w-md md:bottom-24 md:left-16 md:block">
          <h1 className="mb-4 font-headline text-4xl leading-tight text-foreground drop-shadow-lg md:text-5xl">
            {t("auth.heroTitle")}
          </h1>
          <p className="font-body text-lg text-foreground-muted drop-shadow-md">
            {t("auth.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="relative z-10 flex h-2/3 w-full items-center justify-center bg-background p-6 md:h-full md:w-1/2 md:bg-transparent md:p-12 overflow-y-auto">
        <div className="glass-panel relative flex w-full max-w-md flex-col overflow-hidden rounded-xl p-8 md:p-12 my-auto">
          {/* Reservation Prompt Banner if coming from Checkout */}
          {fromCheckout && (
            <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-3.5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon name="confirmation_number" className="text-base" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-semibold text-foreground">
                    Final Step to Confirm Booking
                  </h4>
                  <p className="mt-1 font-body text-xs text-foreground-muted leading-relaxed">
                    Please {isSignup ? "create an account" : "log in"} to finalize tickets for{" "}
                    <span className="font-semibold text-accent">{siteNameParam || "your heritage destination"}</span>.
                    Your booking and verified guide will be automatically linked to your personal dashboard!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 flex border-b border-hairline">
            <Link
              href={`/signup${querySuffix}`}
              className={cn(
                "flex-1 pb-3 text-center font-headline text-lg tracking-wide transition-colors",
                isSignup ? "border-b-2 border-accent text-accent font-semibold" : "text-foreground-muted hover:text-accent",
              )}
            >
              {t("auth.signUpTab")}
            </Link>
            <Link
              href={`/login${querySuffix}`}
              className={cn(
                "flex-1 pb-3 text-center font-headline text-lg tracking-wide transition-colors",
                !isSignup ? "border-b-2 border-accent text-accent font-semibold" : "text-foreground-muted hover:text-accent",
              )}
            >
              {t("auth.loginTab")}
            </Link>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}
            {isSignup && (
              <div className="relative flex flex-col-reverse">
                <input
                  className="museum-input w-full pb-2 pt-4"
                  id="fullname"
                  name="fullname"
                  placeholder=" "
                  required
                  type="text"
                  autoComplete="name"
                />
                <label className="museum-label" htmlFor="fullname">
                  {t("auth.nameLabel")}
                </label>
              </div>
            )}

            <div className="relative flex flex-col-reverse">
              <input
                className="museum-input w-full pb-2 pt-4"
                id="email"
                name="email"
                placeholder=" "
                required
                type="email"
                autoComplete="email"
              />
              <label className="museum-label" htmlFor="email">
                {t("auth.emailLabel")}
              </label>
            </div>

            <div className="relative flex flex-col-reverse">
              <input
                className="museum-input w-full pb-2 pt-4 pr-10"
                id="password"
                name="password"
                placeholder=" "
                required
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <label className="museum-label" htmlFor="password">
                {t("auth.passwordLabel")}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-0 bottom-2 text-foreground-muted hover:text-foreground p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-sm" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-label text-xs font-bold uppercase tracking-wider text-background shadow transition-all hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>
                  {fromCheckout
                    ? isSignup
                      ? "Create Account & Confirm Booking"
                      : "Log In & Confirm Booking"
                    : isSignup
                    ? t("auth.signUpButton")
                    : t("auth.loginButton")}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
