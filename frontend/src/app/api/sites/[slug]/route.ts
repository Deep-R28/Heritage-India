import { NextResponse } from "next/server";
import { getAllApiSites } from "@/lib/server-sites";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const raw = (params.slug || "").toLowerCase().trim();
    const slugHyphen = raw.replace(/[\s_]+/g, "-");
    const slugSpace = raw.replace(/[-_]+/g, " ");
    const sites = getAllApiSites();
    const site = sites.find(
      (s) =>
        s.slug.toLowerCase() === raw ||
        s.slug.toLowerCase() === slugHyphen ||
        s.id.toLowerCase() === raw ||
        s.id.toLowerCase() === slugHyphen ||
        s.name.toLowerCase() === raw ||
        s.name.toLowerCase() === slugSpace
    );

    if (!site) {
      return NextResponse.json(
        { data: null, error: { message: `Site '${raw}' not found`, code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: site, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching site";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
