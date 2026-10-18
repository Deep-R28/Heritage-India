import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiBooking } from "@/lib/api";

export async function GET() {
  try {
    const cookieStore = cookies();
    const rawSaved = cookieStore.get("heritage_saved_sites")?.value;
    let savedCount = 3;
    if (rawSaved) {
      try {
        const arr = JSON.parse(Buffer.from(rawSaved, "base64").toString("utf-8"));
        if (Array.isArray(arr)) savedCount = arr.length;
      } catch {
        // ignore
      }
    }

    const rawBookings = cookieStore.get("heritage_bookings")?.value;
    let bookings: ApiBooking[] = [];
    if (rawBookings) {
      try {
        bookings = JSON.parse(Buffer.from(rawBookings, "base64").toString("utf-8"));
      } catch {
        bookings = [];
      }
    }

    // Default sample booking if none exist
    if (bookings.length === 0) {
      bookings = [
        {
          id: "bk_demo_1",
          reference: "HER-2026-8842",
          visitDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          partySize: 2,
          totalINR: 5060,
          status: "UPCOMING",
          createdAt: new Date().toISOString(),
          site: {
            id: "taj-mahal",
            slug: "taj-mahal",
            name: "The Taj Mahal",
            city: "Agra",
            state: "Uttar Pradesh",
            images: ["https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"],
          },
          guide: {
            id: "g-1004",
            name: "Rajesh Kumar",
            licenseId: "ASI-RAJ-001",
            licenseStatus: "VERIFIED",
          },
        },
      ];
    }

    const upcomingBookings = bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      site: {
        id: b.site.id,
        slug: b.site.slug,
        name: b.site.name,
        city: b.site.city,
        images: b.site.images,
      },
      guide: b.guide
        ? {
            id: b.guide.id,
            name: b.guide.name,
            licenseStatus: b.guide.licenseStatus,
          }
        : null,
      visitDate: b.visitDate,
      partySize: b.partySize,
      totalINR: b.totalINR,
      status: b.status,
    }));

    const rawNotifs = cookieStore.get("heritage_notifications")?.value;
    let unreadNotifsCount = 0;
    if (rawNotifs) {
      try {
        const notifs = JSON.parse(Buffer.from(rawNotifs, "base64").toString("utf-8"));
        if (Array.isArray(notifs)) {
          unreadNotifsCount = notifs.filter((n: { readAt: string | null }) => !n.readAt).length;
        }
      } catch {
        unreadNotifsCount = 0;
      }
    }

    const uniqueSitesVisited = new Set(
      bookings.filter((b) => b.status === "COMPLETED" || new Date(b.visitDate) <= new Date()).map((b) => b.site.slug)
    ).size;

    return NextResponse.json({
      data: {
        stats: {
          sitesVisited: uniqueSitesVisited || Math.min(bookings.length, 3),
          guidesBooked: bookings.filter((b) => Boolean(b.guide)).length,
          savedSites: savedCount,
          unreadNotifications: unreadNotifsCount,
          languagesUsed: ["English", "Hindi"],
        },
        upcomingBookings,
      },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching dashboard";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
