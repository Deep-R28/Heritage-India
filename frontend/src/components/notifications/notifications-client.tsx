"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/lib/data";
import { formatLocaleDate } from "@/lib/locale-date";

const typeIcon: Record<NotificationItem["type"], string> = {
  booking: "event_available",
  "crowd-alert": "groups",
  "guide-verification": "verified_user",
};

const typeTone: Record<NotificationItem["type"], string> = {
  booking: "text-verified",
  "crowd-alert": "text-warning",
  "guide-verification": "text-accent",
};

function notificationCopy(item: NotificationItem, t: (key: string, opts?: Record<string, unknown>) => string, lang: string) {
  const eventDate = item.eventDate ? formatLocaleDate(item.eventDate, lang) : undefined;
  if (item.type === "booking") {
    const key = item.variant === "cancelled" ? "bookingCancelled" : "bookingConfirmed";
    return {
      title: t(`notifications.types.${key}.title`),
      message: t(`notifications.types.${key}.message`, { guide: item.guide, site: item.site, date: eventDate }),
    };
  }
  if (item.type === "crowd-alert") {
    return {
      title: t("notifications.types.crowdAlert.title", { site: item.site }),
      message: t("notifications.types.crowdAlert.message", { site: item.site, percent: item.percent }),
    };
  }
  return {
    title: t("notifications.types.guideVerification.title"),
    message: t("notifications.types.guideVerification.message", { guide: item.guide }),
  };
}

export function NotificationsClient({ initial }: { initial: NotificationItem[] }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(initial);

  const groups = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const item of items) {
      const key = formatLocaleDate(item.date, i18n.language);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [items, i18n.language]);

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 font-headline text-3xl text-foreground md:text-4xl">{t("notifications.heading")}</h1>
          <p className="font-body text-sm text-foreground-muted">
            {unreadCount > 0 ? t("notifications.unread", { count: unreadCount }) : t("notifications.allCaughtUp")}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, read: true })))}
        >
          {t("notifications.markAllRead")}
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        {groups.map(([date, group]) => (
          <div key={date}>
            <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-foreground-muted">
              {date}
            </h2>
            <div className="flex flex-col gap-3">
              {group.map((item) => {
                const copy = notificationCopy(item, t, i18n.language);
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "flex items-start gap-4 p-5 transition-colors",
                      !item.read && "border-accent/40",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-hover",
                        typeTone[item.type],
                      )}
                    >
                      <Icon name={typeIcon[item.type]} className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-headline text-base text-foreground">{copy.title}</h3>
                        {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      </div>
                      <p className="font-body text-sm text-foreground-muted">{copy.message}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-16 text-center font-body text-sm text-foreground-muted">
            {t("notifications.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
