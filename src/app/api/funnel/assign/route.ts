import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const activeFunnels = await db
      .select()
      .from(funnels)
      .where(eq(funnels.isActive, true))
      .all();

    if (activeFunnels.length === 0) {
      return NextResponse.json({ funnelId: null, name: null, config: {} });
    }

    // Check if visitor already has an assignment from a valid active funnel
    const existingId = request.cookies.get("funnel_id")?.value;
    const existing = existingId ? activeFunnels.find((f) => f.id === existingId) : null;

    const assigned = existing ?? activeFunnels[Math.floor(Math.random() * activeFunnels.length)];
    const config = JSON.parse(assigned.config || "{}");

    const response = NextResponse.json({
      funnelId: assigned.id,
      name: assigned.name,
      config,
    });

    response.cookies.set("funnel_id", assigned.id, {
      httpOnly: false, // must be readable client-side for tracking
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error assigning funnel:", error);
    return NextResponse.json({ funnelId: null, name: null, config: {} });
  }
}
