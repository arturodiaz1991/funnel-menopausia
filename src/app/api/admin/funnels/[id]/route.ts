import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { config } from "@/lib/config";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === config.adminPassword;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.config !== undefined) updates.config = JSON.stringify(body.config);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const updated = await db
      .update(funnels)
      .set(updates)
      .where(eq(funnels.id, id))
      .returning()
      .get();

    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ...updated, config: JSON.parse(updated.config || "{}") });
  } catch (error) {
    console.error("Error updating funnel:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.delete(funnels).where(eq(funnels.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting funnel:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
