import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ApiBooking } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, method = "UPI" } = body;

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

    const booking = existingBookings.find((b) => b.id === bookingId) || existingBookings[0];
    const bookingReference = booking ? booking.reference : `HER-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `pay_${Date.now()}`;
    const providerRef = `${method}_${bookingReference}`;

    return NextResponse.json(
      {
        data: {
          success: true,
          paymentId,
          providerRef,
          bookingReference,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing payment";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
