"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CrowdGauge } from "@/components/ui/crowd-gauge";
import { useTranslation } from "react-i18next";
import { api, type ApiSite } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { SITE_TRANSLATIONS } from "@/lib/site-translations";
import type { LanguageCode } from "@/i18n/config";

interface DashboardData {
  stats: {
    sitesVisited: number;
    guidesBooked: number;
    savedSites: number;
    languagesUsed: string[];
  };
  upcomingBookings: Array<{
    id: string;
    reference: string;
    site: { id: string; slug: string; name: string; city: string; images: string[] };
    guide: { id: string; name: string; licenseStatus: string } | null;
    visitDate: string;
    partySize: number;
    totalINR: number;
    status: string;
  }>;
}

export function DashboardView() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const langCode = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";
  const [data, setData] = useState<DashboardData | null>(null);
  const [savedSites, setSavedSites] = useState<ApiSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, savedRes] = await Promise.all([
          api.me.dashboard().catch(() => null),
          api.me.savedSites().catch(() => []),
        ]);

        let localBookings = [];
        if (typeof window !== "undefined") {
          try {
            localBookings = JSON.parse(localStorage.getItem("heritage_bookings") || "[]");
          } catch {
            localBookings = [];
          }
        }

        if (dashRes) {
          const mergedBookings = [...localBookings, ...(dashRes.upcomingBookings || [])];
          const seen = new Set<string>();
          const uniqueBookings = [];
          for (const b of mergedBookings) {
            const key = b.reference || b.id;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueBookings.push(b);
            }
          }

          setData({
            ...dashRes,
            stats: {
              ...dashRes.stats,
              savedSites: savedRes.length || dashRes.stats.savedSites,
              guidesBooked: uniqueBookings.filter((b) => Boolean(b.guide)).length || dashRes.stats.guidesBooked,
            },
            upcomingBookings: uniqueBookings,
          });
        }

        if (savedRes) setSavedSites(savedRes);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:px-8">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-accent">Concierge Dashboard</p>
          <h1 className="mt-2 font-headline text-3xl text-foreground md:text-4xl">
            Hello, {user?.name || "Explorer"}
          </h1>
          <p className="mt-1 font-body text-sm text-foreground-muted">
            Your personalized heritage itinerary, booking receipts, and crowd alerts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-2 font-label text-xs uppercase tracking-wider text-foreground hover:bg-surface-hover"
          >
            <Icon name="travel_explore" className="text-base text-accent" />
            Explore Sites
          </Link>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase tracking-wider text-background hover:bg-accent/90"
          >
            <Icon name="smart_toy" className="text-base" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sites Visited"
          value={data?.stats.sitesVisited ?? 3}
          icon="account_balance"
        />
        <StatCard
          label="Guides Booked"
          value={data?.stats.guidesBooked ?? 2}
          icon="verified_user"
        />
        <StatCard
          label="Saved Sites"
          value={savedSites.length > 0 ? savedSites.length : (data?.stats.savedSites ?? 5)}
          icon="bookmark"
        />
        <StatCard
          label="Languages Used"
          value={(data?.stats.languagesUsed?.length ?? 1) > 1 ? "Multilingual" : "English"}
          icon="translate"
        />
      </div>

      {/* Upcoming Bookings Section */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl text-foreground">Upcoming Journeys</h2>
          <Link href="/dashboard/trips" className="font-label text-xs uppercase tracking-widest text-accent hover:underline">
            View All Trips →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-hairline bg-surface/50" />
            ))}
          </div>
        ) : (data?.upcomingBookings?.length ?? 0) === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Icon name="calendar_today" className="mb-3 text-3xl text-foreground-muted" />
            <p className="font-body text-base text-foreground">No upcoming bookings found</p>
            <p className="mt-1 font-body text-xs text-foreground-muted">Plan your next heritage visit with certified ASI guides.</p>
            <Link href="/explore" className="mt-4 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase text-background">
              Book a Tour
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data?.upcomingBookings.map((b) => {
              const bSiteTr = SITE_TRANSLATIONS[b.site.slug]?.[langCode];
              return (
              <Card key={b.id} className="relative overflow-hidden p-6 transition-all hover:border-accent/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-accent">{b.reference}</span>
                    <h3 className="mt-1 font-headline text-xl text-foreground">{bSiteTr?.name || b.site.name}</h3>
                    <p className="font-body text-xs text-foreground-muted">{bSiteTr?.region || b.site.city}</p>
                  </div>
                  <Badge tone="verified">Confirmed</Badge>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-hairline pt-4 text-xs text-foreground-muted">
                  <div className="flex items-center gap-1.5">
                    <Icon name="event" className="text-base text-accent" />
                    <span>{new Date(b.visitDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="group" className="text-base text-accent" />
                    <span>{b.partySize} {b.partySize === 1 ? "Guest" : "Guests"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="payments" className="text-base text-accent" />
                    <span>₹{b.totalINR.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved Sites Showcase */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl text-foreground">Saved Heritage Sites</h2>
            <p className="font-body text-xs text-foreground-muted">Live crowd telemetry from your bookmarked monuments.</p>
          </div>
          <Link href="/explore" className="font-label text-xs uppercase tracking-widest text-accent hover:underline">
            Browse More →
          </Link>
        </div>

        {savedSites.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Icon name="bookmark_border" className="mb-3 text-3xl text-foreground-muted" />
            <p className="font-body text-sm text-foreground">You haven&apos;t saved any sites yet.</p>
            <p className="mt-1 font-body text-xs text-foreground-muted">Click the heart or bookmark icon on any monument to track crowd conditions.</p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedSites.map((site) => {
              const sSiteTr = SITE_TRANSLATIONS[site.slug]?.[langCode];
              const siteName = sSiteTr?.name || site.name;
              const siteRegion = sSiteTr?.region || `${site.city}, ${site.state}`;
              return (
              <Card key={site.id} className="group overflow-hidden transition-all hover:border-accent/40">
                <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                  {site.images[0] && (
                    <Image
                      src={site.images[0]}
                      alt={siteName}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        await api.me.removeSavedSite(site.id);
                        setSavedSites((prev) => prev.filter((s) => s.id !== site.id));
                      }}
                      className="rounded-full bg-background/80 p-2 text-accent backdrop-blur hover:bg-background"
                      title="Remove from saved"
                    >
                      <Icon name="favorite" className="text-base" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-headline text-lg text-foreground group-hover:text-accent">{siteName}</h3>
                      <p className="font-body text-xs text-foreground-muted">{siteRegion}</p>
                    </div>
                    <span className="font-mono text-xs text-accent">₹{site.entryFeeINR}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                    <div className="flex items-center gap-2">
                      <CrowdGauge percent={site.crowd.percent} size="sm" />
                      <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">
                        {site.crowd.level}
                      </span>
                    </div>
                    <Link
                      href={`/sites/${site.slug}`}
                      className="font-label text-xs uppercase tracking-wider text-accent hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Concierge Navigation Shortcuts */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/explore/map"
          className="flex items-center gap-4 rounded-xl border border-hairline bg-surface p-5 transition-all hover:border-accent hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon name="map" className="text-2xl" />
          </div>
          <div>
            <h4 className="font-headline text-base text-foreground">Interactive Map</h4>
            <p className="font-body text-xs text-foreground-muted">View live pins and crowd levels across India.</p>
          </div>
        </Link>

        <Link
          href="/guides/verify"
          className="flex items-center gap-4 rounded-xl border border-hairline bg-surface p-5 transition-all hover:border-accent hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon name="verified_user" className="text-2xl" />
          </div>
          <div>
            <h4 className="font-headline text-base text-foreground">Guide Verification</h4>
            <p className="font-body text-xs text-foreground-muted">Verify official ASI badges and transparent rates.</p>
          </div>
        </Link>

        <Link
          href="/account/settings"
          className="flex items-center gap-4 rounded-xl border border-hairline bg-surface p-5 transition-all hover:border-accent hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon name="settings" className="text-2xl" />
          </div>
          <div>
            <h4 className="font-headline text-base text-foreground">Settings & Vision</h4>
            <p className="font-body text-xs text-foreground-muted">Calibrate themes, color vision modes, and language.</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
