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
    const { guideId, visitDate, partySize, guideName, visitSlot, time } = body;

    if (!siteId) {
      return NextResponse.json(
        { data: null, error: { message: "siteId or siteSlug is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const sites = getAllApiSites();
    const site = sites.find((s) => s.id === siteId || s.slug === siteId) || sites[0];
    
    let guide: {
      id: string;
      name: string;
      asiId?: string | null;
      verified?: boolean;
      rateInr: number;
      [key: string]: unknown;
    } | null | undefined = null;
    const normalizedGuideId = String(guideId || "").toLowerCase();
    const normalizedGuideName = String(guideName || "").toLowerCase();

    if (guideId && guideId !== "none" && guideId !== "self") {
      guide = guideRegistryRaw.find(
        (g) =>
          g.id.toLowerCase() === normalizedGuideId ||
          (g.asiId && g.asiId.toLowerCase() === normalizedGuideId) ||
          g.name.toLowerCase().includes(normalizedGuideId) ||
          (normalizedGuideName && g.name.toLowerCase().includes(normalizedGuideName)) ||
          (normalizedGuideId.includes("rajesh") && g.name.toLowerCase().includes("rajesh")) ||
          (normalizedGuideId.includes("vikram") && g.name.toLowerCase().includes("vikram")) ||
          (normalizedGuideId.includes("priya") && g.name.toLowerCase().includes("priya")) ||
          (normalizedGuideId.includes("meera") && g.name.toLowerCase().includes("meera")) ||
          (normalizedGuideId.includes("arun") && g.name.toLowerCase().includes("arun")) ||
          (normalizedGuideId.includes("agr-01") && g.name.toLowerCase().includes("rajesh")) ||
          (normalizedGuideId.includes("agr-05") && g.name.toLowerCase().includes("vikram"))
      );

      if (!guide) {
        const vGuide = VERIFIED_GUIDES.find(
          (g) =>
            g.id.toLowerCase() === normalizedGuideId ||
            (normalizedGuideName && g.name.toLowerCase().includes(normalizedGuideName)) ||
            (normalizedGuideId.includes("rajesh") && g.name.toLowerCase().includes("rajesh")) ||
            (normalizedGuideId.includes("vikram") && g.name.toLowerCase().includes("vikram")) ||
            (normalizedGuideId.includes("priya") && g.name.toLowerCase().includes("priya")) ||
            (normalizedGuideId.includes("meera") && g.name.toLowerCase().includes("meera")) ||
            (normalizedGuideId.includes("agr-01") && g.name.toLowerCase().includes("rajesh"))
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
    }

    const count = Math.max(1, Number(partySize) || 1);
    const siteTotal = site.entryFeeINR * count;
    const guideTotal = guide ? guide.rateInr * 3 : 0;
    const subtotal = siteTotal + guideTotal;
    const totalINR = subtotal + Math.round(subtotal * 0.1) + Math.round(subtotal * 0.05);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `HER-2026-${randomSuffix}`;
    const id = `bk_${Date.now()}_${randomSuffix}`;
    const effectiveSlot = visitSlot || time || "09:00 AM (Morning Slot)";

    const newBooking: ApiBooking = {
      id,
      reference,
      visitDate: visitDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      visitSlot: effectiveSlot,
      time: effectiveSlot,
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

    const dateFormatted = visitDate ? String(visitDate).split("T")[0] : "upcoming date";
    const bookingNotification = {
      id: `notif_${Date.now()}_${randomSuffix}`,
      userId: (body.userId as string) || "user_explorer",
      type: "BOOKING" as const,
      title: `Booking Confirmed: ${site.name}`,
      body: `Ticket booked for ${count} member${count > 1 ? "s" : ""} for ${site.name} at ${effectiveSlot} on ${dateFormatted} (Ref: ${reference}) with ${guide ? guide.name : "Self-Guided"}.`,
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
