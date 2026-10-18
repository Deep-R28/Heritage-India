import { NextResponse } from "next/server";
import { getAllApiSites } from "@/lib/server-sites";
import guideRegistryRaw from "@/data/guide-registry.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");
    const guideId = searchParams.get("guideId");
    const partySize = Math.max(1, parseInt(searchParams.get("partySize") || "1", 10));

    const sites = getAllApiSites();
    const matchedSite = siteId ? sites.find((s) => s.id === siteId || s.slug === siteId) : sites[0];

    const matchedGuide = guideId
      ? guideRegistryRaw.find((g) => g.id === guideId || g.asiId === guideId)
      : guideRegistryRaw[0];

    const entryFeePerPerson = matchedSite?.entryFeeINR ?? 1100;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideFeeTotal = matchedGuide ? matchedGuide.rateInr * 3 : 0;
    const subtotal = siteEntryTotal + guideFeeTotal;
    const conciergeFee = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + conciergeFee + taxes;

    const lineItems = [
      { label: `Monument Entry (${partySize} ticket${partySize > 1 ? "s" : ""})`, amountINR: siteEntryTotal },
    ];
    if (matchedGuide) {
      lineItems.push({ label: `ASI Guide (${matchedGuide.name}, 3 hrs)`, amountINR: guideFeeTotal });
    }
    lineItems.push({ label: "Concierge & Safety Support", amountINR: conciergeFee });
    lineItems.push({ label: "Government Taxes (GST 5%)", amountINR: taxes });

    return NextResponse.json({
      data: {
        siteId: matchedSite?.id,
        siteName: matchedSite?.name,
        partySize,
        guide: matchedGuide ? { id: matchedGuide.id, name: matchedGuide.name, ratePerHourINR: matchedGuide.rateInr } : null,
        lineItems,
        totalINR: grandTotal,
        sites: sites.map((s) => ({ id: s.id, slug: s.slug, name: s.name, city: s.city, entryFeeINR: s.entryFeeINR })),
        sampleGuides: guideRegistryRaw.map((g) => ({ id: g.id, name: g.name, ratePerHourINR: g.rateInr })),
      },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error calculating pricing";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const siteId = body.siteId || body.siteSlug;
    const guideId = body.guideId;
    const partySize = Math.max(1, parseInt(body.partySize || (body.tickets ? (body.tickets.adult || 1) + (body.tickets.child || 0) + (body.tickets.foreigner || 0) : "1"), 10));

    const sites = getAllApiSites();
    const matchedSite = siteId ? sites.find((s) => s.id === siteId || s.slug === siteId) : sites[0];

    const matchedGuide = guideId
      ? guideRegistryRaw.find((g) => g.id === guideId || g.asiId === guideId)
      : null;

    const entryFeePerPerson = matchedSite?.entryFeeINR ?? 1100;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideFeeTotal = matchedGuide ? matchedGuide.rateInr * 3 : 0;
    const subtotal = siteEntryTotal + guideFeeTotal;
    const conciergeFee = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + conciergeFee + taxes;

    const lineItems = [
      { label: `Monument Entry (${partySize} ticket${partySize > 1 ? "s" : ""})`, amountINR: siteEntryTotal },
    ];
    if (matchedGuide) {
      lineItems.push({ label: `ASI Guide (${matchedGuide.name}, 3 hrs)`, amountINR: guideFeeTotal });
    }
    lineItems.push({ label: "Concierge & Safety Support", amountINR: conciergeFee });
    lineItems.push({ label: "Government Taxes (GST 5%)", amountINR: taxes });

    return NextResponse.json({
      data: {
        siteId: matchedSite?.id,
        siteName: matchedSite?.name,
        partySize,
        guide: matchedGuide ? { id: matchedGuide.id, name: matchedGuide.name, ratePerHourINR: matchedGuide.rateInr } : null,
        lineItems,
        totalINR: grandTotal,
        sites: sites.map((s) => ({ id: s.id, slug: s.slug, name: s.name, city: s.city, entryFeeINR: s.entryFeeINR })),
        sampleGuides: guideRegistryRaw.map((g) => ({ id: g.id, name: g.name, ratePerHourINR: g.rateInr })),
      },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error calculating pricing";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}

