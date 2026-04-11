import { NextRequest, NextResponse } from "next/server";
import { trackPageView } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = body.page as string;
    const funnelId = body.funnelId as string | undefined;
    if (!page || typeof page !== "string") {
      return NextResponse.json({ error: "Falta page" }, { status: 400 });
    }
    await trackPageView(page, funnelId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
