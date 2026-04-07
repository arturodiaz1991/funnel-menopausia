import { NextRequest, NextResponse } from "next/server";
import { getFunnelStats } from "@/db/queries";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const stats = await getFunnelStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
