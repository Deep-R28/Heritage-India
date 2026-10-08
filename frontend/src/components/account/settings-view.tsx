"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { ThemePicker, VisionModeGrid } from "@/components/ui/accessibility-mode-switcher";
import { languages, type LanguageCode } from "@/i18n/config";

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

function ComingSoon({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-hover/30 px-8 py-16 text-center">
      <Icon name="hourglass_empty" className="text-3xl text-foreground-muted" />
      <p className="font-body text-sm text-foreground-muted">{text}</p>
    </div>
  );
}

export function SettingsView() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<TabKey>("theme");
  const current = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-8">
      <h1 className="mb-10 font-headline text-3xl text-foreground md:text-4xl">{t("settings.heading")}</h1>

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
                  ? "bg-accent/10 text-accent"
                  : "text-foreground-muted hover:bg-surface-hover/60 hover:text-foreground",
              )}
            >
              <Icon name={item.icon} className="text-base" />
              {t(`settings.tabs.${item.key}`)}
            </button>
          ))}
        </nav>

        <div className="flex-grow">
          {tab === "profile" && <ComingSoon text={t("settings.profile.comingSoon")} />}

          {tab === "theme" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">{t("settings.theme.heading")}</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">{t("settings.theme.body")}</p>
              <ThemePicker />
            </Card>
          )}

          {tab === "accessibility" && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-1 font-headline text-xl text-foreground">{t("accessibility.colorVisionMode")}</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">{t("settings.theme.body")}</p>
              <VisionModeGrid />
            </Card>
          )}

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

          {tab === "payment" && <ComingSoon text={t("settings.payment.comingSoon")} />}
          {tab === "savedSites" && <ComingSoon text={t("settings.savedSites.comingSoon")} />}
          {tab === "notifications" && <ComingSoon text={t("settings.notifications.comingSoon")} />}
        </div>
      </div>
    </div>
  );
}
