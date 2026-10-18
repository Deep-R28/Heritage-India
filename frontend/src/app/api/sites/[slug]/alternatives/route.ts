import { NextResponse } from "next/server";
import { getAllApiSites } from "@/lib/server-sites";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = (params.slug || "").toLowerCase().trim();
    const sites = getAllApiSites();
    const target = sites.find((s) => s.slug.toLowerCase() === slug || s.id.toLowerCase() === slug) || sites[0];

    const alternatives = sites
      .filter((s) => s.slug !== target.slug && s.crowd.level !== "HIGH")
      .slice(0, 4)
      .map((s) => ({
        ...s,
        distanceDeltaKm: Math.round(Math.abs(s.lat - target.lat) * 111),
      }));

    return NextResponse.json({
      data: {
        target: {
          id: target.id,
          slug: target.slug,
          name: target.name,
          crowd: { level: target.crowd.level, percent: target.crowd.percent },
        },
        alternatives,
      },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching alternatives";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
