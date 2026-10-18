import { NextResponse } from "next/server";
import { getAllApiSites } from "@/lib/server-sites";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const category = searchParams.get("category");
    const crowd = searchParams.get("crowd");

    let sites = getAllApiSites();

    if (q) {
      sites = sites.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      );
    }

    if (category && category !== "All" && category !== "all") {
      sites = sites.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (crowd && crowd !== "any") {
      sites = sites.filter((s) => s.crowd.level.toLowerCase() === crowd.toLowerCase());
    }

    return NextResponse.json({ data: sites, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error listing sites";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
