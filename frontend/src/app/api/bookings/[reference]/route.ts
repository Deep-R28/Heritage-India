import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiBooking } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { reference: string } }
) {
  try {
    const reference = (params.reference || "").toUpperCase().trim();
    const cookieStore = cookies();
    const raw = cookieStore.get("heritage_bookings")?.value;
    let existingBookings: ApiBooking[] = [];
    if (raw) {
      try {
        existingBookings = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        existingBookings = [];
      }
    }

    const matched = existingBookings.find(
      (b) => b.reference.toUpperCase() === reference || b.id === params.reference
    );

    if (matched) {
      return NextResponse.json({ data: matched, error: null });
    }

    // Default mock fallback if directly loaded
    const fallbackBooking: ApiBooking = {
      id: `bk_${params.reference}`,
      reference,
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
      payment: {
        status: "PAID",
        method: "UPI",
        providerRef: `UPI-${reference}`,
        amountINR: 5060,
      },
    };

    return NextResponse.json({ data: fallbackBooking, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching booking";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
