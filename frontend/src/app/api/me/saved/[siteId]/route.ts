import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllApiSites } from "@/lib/server-sites";

export async function POST(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
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

    if (!savedIds.includes(siteId)) {
      savedIds.push(siteId);
    }

    cookieStore.set(
      "heritage_saved_sites",
      Buffer.from(JSON.stringify(savedIds)).toString("base64"),
      {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    const allSites = getAllApiSites();
    const site = allSites.find((s) => s.id === siteId || s.slug === siteId) || { id: siteId };

    return NextResponse.json({ data: site, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving site";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
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

    savedIds = savedIds.filter((id) => id !== siteId);

    cookieStore.set(
      "heritage_saved_sites",
      Buffer.from(JSON.stringify(savedIds)).toString("base64"),
      {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    return NextResponse.json({ data: { success: true }, error: null }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error removing saved site";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
