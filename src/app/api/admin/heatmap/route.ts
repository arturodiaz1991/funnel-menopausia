import { NextRequest, NextResponse } from "next/server";
import { getHeatmapData } from "@/db/queries";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await getHeatmapData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching heatmap:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
