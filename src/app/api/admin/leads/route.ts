import { NextRequest, NextResponse } from "next/server";
import { getLeadsWithStats, getLeadDetail } from "@/db/queries";
import { config } from "@/lib/config";
import { db } from "@/db";
import { leads, leadSessions, videoEvents, emailLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("id");

    if (leadId) {
      const detail = await getLeadDetail(leadId);
      if (!detail) {
        return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
      }
      return NextResponse.json(detail);
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const result = await getLeadsWithStats(page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");

  if (!leadId) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  try {
    await db.delete(emailLog).where(eq(emailLog.leadId, leadId));
    await db.delete(videoEvents).where(eq(videoEvents.leadId, leadId));
    await db.delete(leadSessions).where(eq(leadSessions.leadId, leadId));
    await db.delete(leads).where(eq(leads.id, leadId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
