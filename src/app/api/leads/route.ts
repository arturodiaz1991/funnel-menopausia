import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, funnelId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email no valido" }, { status: 400 });
    }

    // Check if lead already exists
    const existing = await db.select().from(leads).where(eq(leads.email, email.toLowerCase())).get();

    let leadId: string;

    if (existing) {
      leadId = existing.id;
    } else {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const ua = request.headers.get("user-agent") || "unknown";

      const newLead = await db.insert(leads).values({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        funnelId: funnelId || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
        ipAddress: ip,
        userAgent: ua,
      }).returning().get();

      leadId = newLead.id;

      // TODO: Send welcome email via Resend (implemented in Phase 6)
    }

    // Generate JWT token for analytics tracking
    const secret = new TextEncoder().encode(config.jwtSecret);
    const token = await new SignJWT({ leadId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    const response = NextResponse.json({ success: true, leadId });

    response.cookies.set("lead_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
