import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadSessions, videoEvents, emailLog } from "@/db/schema";
import { config } from "@/lib/config";

export async function DELETE(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await db.delete(emailLog);
    await db.delete(videoEvents);
    await db.delete(leadSessions);
    await db.delete(leads);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
