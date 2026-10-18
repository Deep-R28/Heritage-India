import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllApiSites } from "@/lib/server-sites";

export async function GET() {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get("heritage_saved_sites")?.value;
    let savedIds: string[] = [];
    if (raw) {
      try {
        savedIds = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        savedIds = [];
      }
    }

    const allSites = getAllApiSites();
    // If no saved sites yet, provide a curated default set so dashboard looks alive
    const targetIds = savedIds.length > 0 ? savedIds : ["taj-mahal", "hampi", "amber-fort"];
    const matched = allSites.filter((s) => targetIds.includes(s.id) || targetIds.includes(s.slug));

    return NextResponse.json({ data: matched, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching saved sites";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
