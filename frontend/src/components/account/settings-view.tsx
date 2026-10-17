"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { CrowdGauge } from "@/components/ui/crowd-gauge";
import { ThemePicker, VisionModeGrid } from "@/components/ui/accessibility-mode-switcher";
import { languages, type LanguageCode } from "@/i18n/config";
import { useAuth } from "@/hooks/use-auth";
import { api, type ApiSite } from "@/lib/api";

const TABS = [
  { key: "profile", icon: "person" },
  { key: "theme", icon: "dark_mode" },
  { key: "accessibility", icon: "palette" },
  { key: "language", icon: "language" },
  { key: "payment", icon: "credit_card" },
  { key: "savedSites", icon: "bookmark" },
  { key: "notifications", icon: "notifications" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function SettingsView() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<TabKey>("theme");
  const current = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Saved sites state
  const [savedSites, setSavedSites] = useState<ApiSite[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (tab === "savedSites") {
      setLoadingSaved(true);
      api.me
        .savedSites()
        .then((sites) => setSavedSites(sites))
        .catch(() => setSavedSites([]))
        .finally(() => setLoadingSaved(false));
    }
  }, [tab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await api.me.updateProfile({ name });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.me.updatePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: "Password updated successfully", error: false });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordMsg({ text: msg, error: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRemoveSaved = async (siteId: string) => {
    try {
      await api.me.removeSavedSite(siteId);
      setSavedSites((prev) => prev.filter((s) => s.id !== siteId));
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-8">
      <h1 className="mb-10 font-headline text-3xl text-foreground md:text-4xl">Profile & Settings</h1>

      {/* Mobile: top tab row. Desktop: left sidebar. */}
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <nav className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:pb-0">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left font-label text-xs uppercase tracking-widest transition-colors",
                tab === item.key
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-foreground-muted hover:bg-surface-hover/60 hover:text-foreground",
              )}
            >
              <Icon name={item.icon} className="text-base" />
              {t(`settings.tabs.${item.key}`, item.key)}
            </button>
          ))}
        </nav>

        <div className="flex-grow">
          {/* PROFILE PANEL */}
          {tab === "profile" && (
            <div className="space-y-8">
              <Card className="p-6 md:p-8">
                <h2 className="mb-1 font-headline text-xl text-foreground">Personal Information</h2>
                <p className="mb-6 font-body text-xs text-foreground-muted">Manage your explorer profile and account identity.</p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full max-w-md rounded-lg border border-hairline bg-surface px-4 py-2 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || "demo@heritage-india.com"}
                      className="mt-1 w-full max-w-md rounded-lg border border-hairline bg-surface/50 px-4 py-2 font-body text-sm text-foreground-muted opacity-70"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-2 rounded-lg bg-accent px-5 py-2 font-label text-xs uppercase tracking-wider text-background hover:bg-accent/90 disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>

                  {profileSuccess && (
                    <span className="ml-3 font-body text-xs text-verified">Profile updated successfully!</span>
                  )}
                </form>
              </Card>

              <Card className="p-6 md:p-8">
                <h2 className="mb-1 font-headline text-xl text-foreground">Change Password</h2>
                <p className="mb-6 font-body text-xs text-foreground-muted">Ensure your account uses a strong, unique password.</p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="mt-1 w-full max-w-md rounded-lg border border-hairline bg-surface px-4 py-2 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-foreground-muted">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="mt-1 w-full max-w-md rounded-lg border border-hairline bg-surface px-4 py-2 font-body text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="mt-2 rounded-lg border border-hairline bg-surface px-5 py-2 font-label text-xs uppercase tracking-wider text-foreground hover:bg-surface-hover disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>

                  {passwordMsg && (
                    <span className={cn("ml-3 font-body text-xs", passwordMsg.error ? "text-red-400" : "text-verified")}>
                      {passwordMsg.text}
                    </span>
                  )}
                </form>
              </Card>
            </div>
          )}

          {/* THEME PANEL */}
          {tab === "theme" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">{t("settings.theme.heading")}</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">{t("settings.theme.body")}</p>
              <ThemePicker />
            </Card>
          )}

          {/* ACCESSIBILITY PANEL */}
          {tab === "accessibility" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">{t("accessibility.colorVisionMode")}</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">
                Swaps only semantic/status indicators (crowd density, verified seals, alerts) to an Okabe-Ito accessible palette.
              </p>
              <VisionModeGrid />
            </Card>
          )}

          {/* LANGUAGE PANEL */}
          {tab === "language" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">{t("settings.language.heading")}</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">{t("settings.language.body")}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Object.entries(languages).map(([code, { label, nativeLabel }]) => (
                  <button
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      current === code ? "border-accent bg-accent/10" : "border-hairline hover:border-accent/40",
                    )}
                  >
                    <div>
                      <div className="font-headline text-base text-foreground">{nativeLabel}</div>
                      <div className="font-body text-xs text-foreground-muted">{label}</div>
                    </div>
                    {current === code && <Icon name="check_circle" filled className="text-xl text-accent" />}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* PAYMENT METHODS PANEL */}
          {tab === "payment" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">Payment Methods</h2>
              <p className="mb-6 font-body text-xs text-foreground-muted">Stored payment instruments for fast concierge checkout (Test Mode).</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface-hover/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon name="qr_code_2" className="text-xl" />
                    </div>
                    <div>
                      <p className="font-headline text-sm text-foreground">BHIM UPI</p>
                      <p className="font-mono text-xs text-foreground-muted">explorer@okhdfcbank</p>
                    </div>
                  </div>
                  <span className="font-label text-[10px] uppercase text-verified">Default</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface-hover/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon name="credit_card" className="text-xl" />
                    </div>
                    <div>
                      <p className="font-headline text-sm text-foreground">HDFC Visa Signature</p>
                      <p className="font-mono text-xs text-foreground-muted">•••• •••• •••• 8892 (Exp 09/28)</p>
                    </div>
                  </div>
                  <span className="font-label text-[10px] uppercase text-foreground-muted">Active</span>
                </div>
              </div>
            </Card>
          )}

          {/* SAVED SITES PANEL (Phase 1 Requirement) */}
          {tab === "savedSites" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl text-foreground">Saved Heritage Sites</h2>
                  <p className="font-body text-xs text-foreground-muted">Monuments you bookmarked to track live crowd conditions.</p>
                </div>
                <Link href="/explore" className="font-label text-xs uppercase text-accent hover:underline">
                  Browse More →
                </Link>
              </div>

              {loadingSaved ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-40 animate-pulse rounded-xl border border-hairline bg-surface/50" />
                  ))}
                </div>
              ) : savedSites.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                  <Icon name="bookmark_border" className="mb-3 text-4xl text-foreground-muted" />
                  <p className="font-headline text-base text-foreground">No saved sites yet</p>
                  <p className="mt-1 font-body text-xs text-foreground-muted">
                    Save sites on the Explore page or Site Detail to receive automated crowd alerts.
                  </p>
                  <Link href="/explore" className="mt-4 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase text-background">
                    Discover Sites
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {savedSites.map((site) => (
                    <Card key={site.id} className="group overflow-hidden transition-all hover:border-accent/40">
                      <div className="relative h-36 w-full overflow-hidden bg-surface-container">
                        {site.images[0] && (
                          <Image
                            src={site.images[0]}
                            alt={site.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <button
                          onClick={() => handleRemoveSaved(site.id)}
                          className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-accent backdrop-blur hover:bg-background"
                          title="Remove from saved"
                        >
                          <Icon name="delete" className="text-sm" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-headline text-base text-foreground group-hover:text-accent">{site.name}</h3>
                            <p className="font-body text-xs text-foreground-muted">{site.city}, {site.state}</p>
                          </div>
                          <span className="font-mono text-xs text-accent">₹{site.entryFeeINR}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
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
                            Visit →
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {tab === "notifications" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">Notification Preferences</h2>
              <p className="mb-6 font-body text-xs text-foreground-muted">Manage crowd alerts, booking updates, and verified guide notifications.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div>
                    <p className="font-headline text-sm text-foreground">Crowd Shift Alerts</p>
                    <p className="font-body text-xs text-foreground-muted">Receive alerts when saved monuments become HIGH or drop to LOW crowds.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-hairline text-accent focus:ring-accent" />
                </div>

                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <div>
                    <p className="font-headline text-sm text-foreground">Booking & Trip Confirmations</p>
                    <p className="font-body text-xs text-foreground-muted">Receive access passes and itinerary updates.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-hairline text-accent focus:ring-accent" />
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard/notifications"
                    className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-accent hover:underline"
                  >
                    <Icon name="open_in_new" className="text-sm" />
                    Open Notification Center
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
