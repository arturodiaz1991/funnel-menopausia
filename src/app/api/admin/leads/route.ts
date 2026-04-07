import { NextRequest, NextResponse } from "next/server";
import { getLeadsWithStats, getLeadDetail } from "@/db/queries";
import { config } from "@/lib/config";

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
