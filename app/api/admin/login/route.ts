import { NextResponse } from "next/server";
import { setAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!verifyAdminPassword(String(password || ""))) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
