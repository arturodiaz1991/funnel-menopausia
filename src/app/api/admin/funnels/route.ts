import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { config } from "@/lib/config";
import { desc } from "drizzle-orm";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === config.adminPassword;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const all = await db.select().from(funnels).orderBy(desc(funnels.createdAt)).all();
    return NextResponse.json(all.map((f) => ({ ...f, config: JSON.parse(f.config || "{}") })));
  } catch (error) {
    console.error("Error fetching funnels:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, isActive = true, config: funnelConfig = {} } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    const created = await db
      .insert(funnels)
      .values({
        name: name.trim(),
        isActive,
        config: JSON.stringify(funnelConfig),
      })
      .returning()
      .get();
    return NextResponse.json({ ...created, config: JSON.parse(created.config || "{}") }, { status: 201 });
  } catch (error) {
    console.error("Error creating funnel:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
