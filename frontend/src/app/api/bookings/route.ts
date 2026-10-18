import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllApiSites } from "@/lib/server-sites";
import guideRegistryRaw from "@/data/guide-registry.json";
import { VERIFIED_GUIDES } from "@/lib/concierge-fallback";
import type { ApiBooking } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const siteId = body.siteId || body.siteSlug;
    const { guideId, visitDate, partySize, guideName } = body;

    if (!siteId) {
      return NextResponse.json(
        { data: null, error: { message: "siteId or siteSlug is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const sites = getAllApiSites();
    const site = sites.find((s) => s.id === siteId || s.slug === siteId) || sites[0];
    
    let guide = guideId
      ? guideRegistryRaw.find((g) => g.id.toLowerCase() === String(guideId).toLowerCase() || (g.asiId && g.asiId.toLowerCase() === String(guideId).toLowerCase()))
      : null;

    if (!guide && guideId && guideId !== "none") {
      const vGuide = VERIFIED_GUIDES.find(
        (g) => g.id.toLowerCase() === String(guideId).toLowerCase() || (guideName && g.name.toLowerCase().includes(String(guideName).toLowerCase()))
      );
      if (vGuide) {
        guide = {
          id: vGuide.id,
          name: vGuide.name,
          asiId: vGuide.license,
          verified: true,
          photo: null,
          experienceYears: 10,
          languages: vGuide.languages.split(", "),
          specialty: "Heritage & History",
          region: site.city ? `${site.city}, ${site.state}` : site.state,
          rateInr: vGuide.rate,
          rating: vGuide.rating,
          translations: {
            hi: { specialty: "धरोहर एवं इतिहास" },
            es: { specialty: "Patrimonio e Historia" },
          },
        };
      }
    }

    const count = Math.max(1, Number(partySize) || 1);
    const siteTotal = site.entryFeeINR * count;
    const guideTotal = guide ? guide.rateInr * 3 : 0;
    const subtotal = siteTotal + guideTotal;
    const totalINR = subtotal + Math.round(subtotal * 0.1) + Math.round(subtotal * 0.05);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `HER-2026-${randomSuffix}`;
    const id = `bk_${Date.now()}_${randomSuffix}`;

    const newBooking: ApiBooking = {
      id,
      reference,
      visitDate: visitDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      partySize: count,
      totalINR,
      status: "UPCOMING",
      createdAt: new Date().toISOString(),
      site: {
        id: site.id,
        slug: site.slug,
        name: site.name,
        city: site.city,
        state: site.state,
        images: site.images,
      },
      guide: guide
        ? {
            id: guide.id,
            name: guide.name,
            licenseId: guide.asiId || "ASI-VERIFIED",
            licenseStatus: guide.verified ? "VERIFIED" : "UNVERIFIED",
          }
        : null,
      payment: {
        status: "PAID",
        method: "UPI",
        providerRef: `UPI-${reference}`,
        amountINR: totalINR,
      },
    };

    // Save in session cookies
    const cookieStore = cookies();
    let existingBookings: ApiBooking[] = [];
    const raw = cookieStore.get("heritage_bookings")?.value;
    if (raw) {
      try {
        existingBookings = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        existingBookings = [];
      }
    }
    existingBookings.unshift(newBooking);
    cookieStore.set(
      "heritage_bookings",
      Buffer.from(JSON.stringify(existingBookings.slice(0, 20))).toString("base64"),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    // Save real-time notification for the booking
    let existingNotifs: Array<{
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
        existingNotifs = JSON.parse(Buffer.from(rawNotifs, "base64").toString("utf-8"));
      } catch {
        existingNotifs = [];
      }
    }

    const bookingNotification = {
      id: `notif_${Date.now()}_${randomSuffix}`,
      userId: (body.userId as string) || "user_explorer",
      type: "BOOKING" as const,
      title: `Booking Confirmed: ${site.name}`,
      body: `Your official pass for ${count} guest(s) on ${visitDate ? String(visitDate).split("T")[0] : "upcoming date"} (Ref: ${reference}) is confirmed with ${guide ? guide.name : "Self-Guided"}.`,
      readAt: null, // Unread indicator for missed notifications
      createdAt: new Date().toISOString(),
      siteSlug: site.slug,
    };
    existingNotifs.unshift(bookingNotification);

    cookieStore.set(
      "heritage_notifications",
      Buffer.from(JSON.stringify(existingNotifs.slice(0, 30))).toString("base64"),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    return NextResponse.json({ data: newBooking, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating booking";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
