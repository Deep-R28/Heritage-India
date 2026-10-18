import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiBooking } from "@/lib/api";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const targetId = decodeURIComponent(params.id || "").trim();
    if (!targetId) {
      return NextResponse.json(
        { data: null, error: { message: "Booking ID is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const raw = cookieStore.get("heritage_bookings")?.value;
    let bookings: ApiBooking[] = [];
    if (raw) {
      try {
        bookings = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        bookings = [];
      }
    }

    // Also support cancelling default/demo bookings if not yet in cookie
    let bookingIndex = bookings.findIndex(
      (b) => b.id.toLowerCase() === targetId.toLowerCase() || b.reference.toLowerCase() === targetId.toLowerCase()
    );

    if (bookingIndex === -1) {
      // Check if target is a demo booking or reference
      const syntheticBooking: ApiBooking = {
        id: targetId,
        reference: targetId.startsWith("HER-") || targetId.startsWith("HI-") ? targetId : `HER-2026-CANCELLED`,
        visitDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        visitSlot: "09:00 AM (Morning Slot)",
        partySize: 2,
        totalINR: 5060,
        status: "CANCELLED",
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
      };
      bookings.unshift(syntheticBooking);
      bookingIndex = 0;
    } else {
      bookings[bookingIndex] = {
        ...bookings[bookingIndex],
        status: "CANCELLED",
      };
    }

    const cancelledBooking = bookings[bookingIndex];

    // Save updated bookings to cookie
    cookieStore.set(
      "heritage_bookings",
      Buffer.from(JSON.stringify(bookings.slice(0, 20))).toString("base64"),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    // Add real cancellation notification
    let notifs: Array<{
      id: string;
      userId: string;
      type: "BOOKING" | "CROWD_ALERT" | "GUIDE_VERIFICATION";
      title: string;
      body: string;
      readAt: string | null;
      createdAt: string;
      siteSlug?: string;
    }> = [];

    const rawNotifs = cookieStore.get("heritage_notifications")?.value;
    if (rawNotifs) {
      try {
        notifs = JSON.parse(Buffer.from(rawNotifs, "base64").toString("utf-8"));
      } catch {
        notifs = [];
      }
    }

    const cancelNotif = {
      id: `notif_cancel_${Date.now()}`,
      userId: "user_explorer",
      type: "BOOKING" as const,
      title: `Booking Cancelled: ${cancelledBooking.site.name}`,
      body: `Your reservation for ${cancelledBooking.partySize} member(s) at ${cancelledBooking.site.name} on ${cancelledBooking.visitDate ? String(cancelledBooking.visitDate).split("T")[0] : "scheduled date"} (Ref: ${cancelledBooking.reference}) has been successfully cancelled.`,
      readAt: null,
      createdAt: new Date().toISOString(),
      siteSlug: cancelledBooking.site.slug,
    };
    notifs.unshift(cancelNotif);

    cookieStore.set(
      "heritage_notifications",
      Buffer.from(JSON.stringify(notifs.slice(0, 30))).toString("base64"),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    return NextResponse.json({
      data: { success: true, booking: cancelledBooking },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error cancelling booking";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
