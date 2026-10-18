import { NextResponse } from "next/server";
import { getAllApiSites } from "@/lib/server-sites";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = (params.slug || "").toLowerCase().trim();
    const sites = getAllApiSites();
    const site = sites.find((s) => s.slug.toLowerCase() === slug || s.id.toLowerCase() === slug);

    if (!site) {
      return NextResponse.json(
        { data: null, error: { message: `Site '${slug}' not found`, code: "NOT_FOUND" } },
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
