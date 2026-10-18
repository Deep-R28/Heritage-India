import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ data: { success: true }, error: null });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  res.cookies.set("heritage_session", "", { maxAge: 0, path: "/" });
  return res;
}
