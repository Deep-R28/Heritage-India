import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "Explorer").trim();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { data: null, error: { message: "Email is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
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

    const res = NextResponse.json({ data: { user, token }, error: null }, { status: 201 });
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
