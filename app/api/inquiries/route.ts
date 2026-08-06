import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/cms/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await createInquiry({
      name: String(body.name),
      email: String(body.email),
      phone: body.phone ? String(body.phone) : "",
      message: String(body.message),
      source: body.source ? String(body.source) : "contact",
      lotSlug: body.lotSlug ? String(body.lotSlug) : undefined,
      locale: body.locale ? String(body.locale) : "cn",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
