import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const sessionCookie = cookieStore.get("heritage_session")?.value;

  if (!token && !sessionCookie) {
    return NextResponse.json(
      { data: null, error: { message: "Unauthenticated", code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }

  let user = {
    id: "usr_active",
    name: "Rohan Sharma",
    email: "demo@heritage-india.com",
    avatarUrl: null,
    preference: {
      theme: "dark",
      visionMode: "default",
      language: "en",
      onboardingDone: true,
    },
  };

  if (sessionCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      if (decoded && typeof decoded === "object") {
        user = { ...user, ...decoded };
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ data: { user }, error: null }, { status: 200 });
}
