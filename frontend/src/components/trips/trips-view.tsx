"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type ApiBooking } from "@/lib/api";

type StatusFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

export function TripsView() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.me.bookings();
        setBookings(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesFilter = filter === "ALL" || b.status === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.reference.toLowerCase().includes(q) ||
        b.site.name.toLowerCase().includes(q) ||
        (b.guide?.name && b.guide.name.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, search]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      await api.me.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id || b.reference === id ? { ...b, status: "CANCELLED" } : b))
      );
      if (typeof window !== "undefined") {
        try {
          const list: ApiBooking[] = JSON.parse(localStorage.getItem("heritage_bookings") || "[]");
          const updated = list.map((b) => (b.id === id || b.reference === id ? { ...b, status: "CANCELLED" } : b));
          localStorage.setItem("heritage_bookings", JSON.stringify(updated));
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent("heritage-notifications-updated"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel booking";
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-content px-6 py-12 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/dashboard" className="font-label text-xs uppercase tracking-widest text-accent hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 font-headline text-3xl text-foreground md:text-4xl">My Journeys & Trips</h1>
          <p className="mt-1 font-body text-sm text-foreground-muted">
            Manage your verified guide bookings, ticket receipts, and tour schedules.
          </p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase tracking-wider text-background hover:bg-accent/90"
        >
          <Icon name="add" className="text-base" />
          New Reservation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-lg px-3.5 py-1.5 font-label text-xs uppercase tracking-wider transition-colors ${
                filter === st
                  ? "bg-accent text-background font-semibold"
                  : "border border-hairline bg-surface text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Icon name="search" className="absolute left-3 top-2.5 text-base text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips, guides..."
            className="w-full rounded-lg border border-hairline bg-surface py-2 pl-9 pr-3 font-body text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Trips Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-hairline bg-surface/50" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center">
          <Icon name="luggage" className="mb-3 text-4xl text-foreground-muted" />
          <p className="font-headline text-lg text-foreground">No trips found</p>
          <p className="mt-1 font-body text-xs text-foreground-muted">
            {search ? "Try adjusting your search criteria." : "You have no bookings matching this status filter."}
          </p>
          <Link href="/explore" className="mt-5 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase text-background">
            Explore Destinations
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="overflow-hidden p-6 transition-all hover:border-accent/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container sm:block">
                    {b.site.images[0] && (
                      <Image src={b.site.images[0]} alt={b.site.name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-accent">{b.reference}</span>
                      <Badge
                        tone={
                          b.status === "COMPLETED"
                            ? "success"
                            : b.status === "UPCOMING"
                            ? "verified"
                            : "neutral"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <h3 className="mt-1 font-headline text-xl text-foreground">{b.site.name}</h3>
                    <p className="font-body text-xs text-foreground-muted">
                      {b.site.city} • Visit Date: {new Date(b.visitDate).toLocaleDateString("en-IN", { dateStyle: "full" })}
                      {b.visitSlot && ` • Slot: ${b.visitSlot}`}
                    </p>
                    {b.guide && (
                      <p className="mt-1 flex items-center gap-1 font-body text-xs text-accent">
                        <Icon name="verified" className="text-sm" />
                        Guide: {b.guide.name} (ASI Licensed)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 border-t border-hairline pt-3 sm:border-t-0 sm:pt-0">
                  <div className="text-right">
                    <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">Total Paid</span>
                    <p className="font-mono text-lg font-semibold text-foreground">₹{b.totalINR.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/checkout/success?ref=${b.reference}`}
                      className="rounded-lg border border-hairline bg-surface px-3 py-1.5 font-label text-xs uppercase tracking-wider text-foreground hover:bg-surface-hover"
                    >
                      Receipt
                    </Link>
                    {b.status === "UPCOMING" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-label text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
