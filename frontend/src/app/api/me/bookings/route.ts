import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiBooking } from "@/lib/api";

export async function GET() {
  try {
    const cookieStore = cookies();
    const rawBookings = cookieStore.get("heritage_bookings")?.value;
    let bookings: ApiBooking[] = [];
    if (rawBookings) {
      try {
        bookings = JSON.parse(Buffer.from(rawBookings, "base64").toString("utf-8"));
      } catch {
        bookings = [];
      }
    }

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

    return NextResponse.json({ data: bookings, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching user bookings";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
