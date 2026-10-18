import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "demo@heritage-india.com").trim().toLowerCase();
    let name = (body.name || "").trim();

    if (!name || name === "Explorer") {
      if (email === "demo@heritage-india.com") {
        name = "Rohan Sharma";
      } else if (email.includes("@")) {
        const prefix = email.split("@")[0].replace(/[._-]/g, " ");
        name = prefix
          .split(" ")
          .filter(Boolean)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      } else {
        name = "Explorer";
      }
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const user = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatarUrl: null,
      preference: {
        theme: "dark",
        visionMode: "default",
        language: "en",
        onboardingDone: true,
      },
    };

    const sessionPayload = Buffer.from(JSON.stringify(user)).toString("base64");

    const res = NextResponse.json({ data: { user, token }, error: null }, { status: 200 });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    res.cookies.set("heritage_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
