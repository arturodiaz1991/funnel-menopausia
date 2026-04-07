import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videoEvents, leadSessions } from "@/db/schema";
import { getLeadIdFromRequest } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import type { AnalyticsBatchPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const leadId = await getLeadIdFromRequest(request);
    if (!leadId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let body: AnalyticsBatchPayload;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // Handle sendBeacon which sends as text/plain
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { sessionId, events } = body;

    if (!sessionId || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    // Ensure session exists
    let session = await db.select().from(leadSessions)
      .where(and(eq(leadSessions.id, sessionId), eq(leadSessions.leadId, leadId)))
      .get();

    if (!session) {
      session = await db.insert(leadSessions).values({
        id: sessionId,
        leadId,
      }).returning().get();
    }

    // Insert events
    if (events.length > 0) {
      await db.insert(videoEvents).values(
        events.map((event) => ({
          leadId,
          sessionId,
          eventType: event.type,
          timestampSec: event.timestampSec,
          metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        }))
      );
    }

    // Update session summary
    const maxTimestamp = Math.max(...events.map((e) => e.timestampSec), session.maxTimestampSec);
    const hasCtaShown = events.some((e) => e.type === "cta_shown") || session.ctaShown;
    const hasCtaClicked = events.some((e) => e.type === "cta_clicked") || session.ctaClicked;
    const pageLeaveEvent = events.find((e) => e.type === "page_leave");

    await db.update(leadSessions)
      .set({
        lastActiveAt: new Date(),
        maxTimestampSec: maxTimestamp,
        ctaShown: hasCtaShown,
        ctaClicked: hasCtaClicked,
        ...(pageLeaveEvent ? { abandonedAtSec: pageLeaveEvent.timestampSec } : {}),
      })
      .where(eq(leadSessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing analytics:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
