"use client";

import { useMemo, useState, useEffect } from "react";
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
  if (item.message) {
    return {
      title: item.title || item.site || t("notifications.types.bookingConfirmed.title"),
      message: item.message,
    };
  }
  const eventDate = item.eventDate ? formatLocaleDate(item.eventDate, lang) : undefined;
  if (item.type === "booking") {
    // If the notification item carries its own dynamic title/message from real-time booking:
    if (item.site && item.site.includes("Booking")) {
      return {
        title: item.site,
        message: item.guide || t("notifications.types.bookingConfirmed.message", { guide: "ASI Guide", site: "Monument", date: eventDate }),
      };
    }
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
  const [items, setItems] = useState<NotificationItem[]>(initial);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/me/notifications");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            type StoredNotif = {
              id: string;
              type: string;
              title?: string;
              body?: string;
              createdAt: string;
              readAt?: string | null;
            };
            setItems(
              json.data.map((n: StoredNotif) => ({
                id: n.id,
                type:
                  n.type === "BOOKING"
                    ? "booking"
                    : n.type === "CROWD_ALERT"
                    ? "crowd-alert"
                    : "guide-verification",
                variant: n.title?.toLowerCase().includes("cancel") ? "cancelled" : "confirmed",
                site: n.title,
                title: n.title,
                message: n.body,
                guide: n.body,
                date: n.createdAt,
                read: Boolean(n.readAt),
              }))
            );
          } else if (Array.isArray(json.data) && json.data.length === 0) {
            setItems([]);
          }
        }
      } catch (e) {
        console.warn("Failed to load real-time notifications:", e);
      }
    }

    loadNotifications();
    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener("heritage-notifications-updated", handleUpdate);
    return () => window.removeEventListener("heritage-notifications-updated", handleUpdate);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const item of items) {
      const key = formatLocaleDate(item.date, i18n.language);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [items, i18n.language]);

  const unreadCount = items.filter((i) => !i.read).length;

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    try {
      await fetch("/api/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      window.dispatchEvent(new CustomEvent("heritage-notifications-updated", { detail: { unreadCount: 0 } }));
    } catch (e) {
      console.warn("Failed to mark all as read:", e);
    }
  };

  const handleClearAll = async () => {
    setItems([]);
    try {
      await fetch("/api/me/notifications", { method: "DELETE" });
      window.dispatchEvent(new CustomEvent("heritage-notifications-updated", { detail: { unreadCount: 0 } }));
    } catch (e) {
      console.warn("Failed to clear notifications:", e);
    }
  };

  const handleDismissOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/me/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      window.dispatchEvent(new CustomEvent("heritage-notifications-updated"));
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (item.read) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    try {
      await fetch("/api/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      window.dispatchEvent(new CustomEvent("heritage-notifications-updated"));
    } catch (err) {
      console.warn("Failed to mark notification read:", err);
    }
  };

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 font-headline text-3xl text-foreground md:text-4xl">{t("notifications.heading")}</h1>
          <p className="font-body text-sm text-foreground-muted">
            {unreadCount > 0 ? t("notifications.unread", { count: unreadCount }) : t("notifications.allCaughtUp")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
            className="cursor-pointer"
          >
            {t("notifications.markAllRead")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={items.length === 0}
            onClick={handleClearAll}
            className="cursor-pointer border-hairline text-foreground-muted hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <Icon name="delete_sweep" className="mr-1 text-base" />
            Clear All
          </Button>
        </div>
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
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative flex items-start gap-4 p-5 transition-all cursor-pointer hover:border-accent/40",
                      !item.read && "border-accent/50 bg-accent/[0.02]",
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
                    <div className="min-w-0 flex-grow pr-8">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-headline text-base text-foreground">{copy.title}</h3>
                        {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      </div>
                      <p className="font-body text-sm text-foreground-muted">{copy.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDismissOne(item.id, e)}
                      className="absolute right-3 top-3 rounded-full p-1.5 text-foreground-muted opacity-0 transition-opacity hover:bg-surface-elevated hover:text-foreground group-hover:opacity-100 cursor-pointer"
                      title="Dismiss notification"
                      aria-label="Dismiss"
                    >
                      <Icon name="close" className="text-base" />
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-surface-hover text-foreground-muted">
              <Icon name="notifications_none" className="text-2xl" />
            </div>
            <h3 className="font-headline text-lg text-foreground">No notifications</h3>
            <p className="mt-1 font-body text-sm text-foreground-muted">
              You are all caught up! When you book passes or certified guides, alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
