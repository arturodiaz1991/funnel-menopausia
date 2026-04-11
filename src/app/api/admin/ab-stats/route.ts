import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels, leads, leadSessions, pageViews } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { config } from "@/lib/config";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === config.adminPassword;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const allFunnels = await db.select().from(funnels).orderBy(funnels.createdAt).all();

    const stats = await Promise.all(
      allFunnels.map(async (funnel) => {
        const [landingVisitsRow, leadsRow, vslViewersRow, ctaShownRow, ctaClickedRow] =
          await Promise.all([
            db
              .select({ count: count() })
              .from(pageViews)
              .where(and(eq(pageViews.page, "landing"), eq(pageViews.funnelId, funnel.id)))
              .get(),
            db
              .select({ count: count() })
              .from(leads)
              .where(eq(leads.funnelId, funnel.id))
              .get(),
            db
              .select({ count: sql<number>`count(distinct ${leadSessions.leadId})` })
              .from(leadSessions)
              .innerJoin(leads, eq(leadSessions.leadId, leads.id))
              .where(eq(leads.funnelId, funnel.id))
              .get(),
            db
              .select({ count: count() })
              .from(leadSessions)
              .innerJoin(leads, eq(leadSessions.leadId, leads.id))
              .where(and(eq(leads.funnelId, funnel.id), eq(leadSessions.ctaShown, true)))
              .get(),
            db
              .select({ count: count() })
              .from(leadSessions)
              .innerJoin(leads, eq(leadSessions.leadId, leads.id))
              .where(and(eq(leads.funnelId, funnel.id), eq(leadSessions.ctaClicked, true)))
              .get(),
          ]);

        const landingVisits = landingVisitsRow?.count || 0;
        const leadsCount = leadsRow?.count || 0;
        const vslViewers = vslViewersRow?.count || 0;
        const ctaShown = ctaShownRow?.count || 0;
        const ctaClicked = ctaClickedRow?.count || 0;

        return {
          id: funnel.id,
          name: funnel.name,
          isActive: funnel.isActive,
          config: JSON.parse(funnel.config || "{}"),
          landingVisits,
          leads: leadsCount,
          vslViewers,
          ctaShown,
          ctaClicked,
          // Conversion rates
          leadConvRate: landingVisits > 0 ? (leadsCount / landingVisits) * 100 : null,
          vslConvRate: leadsCount > 0 ? (vslViewers / leadsCount) * 100 : null,
          ctaShownRate: vslViewers > 0 ? (ctaShown / vslViewers) * 100 : null,
          ctaClickRate: vslViewers > 0 ? (ctaClicked / vslViewers) * 100 : null,
          overallConvRate: landingVisits > 0 ? (ctaClicked / landingVisits) * 100 : null,
        };
      })
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching A/B stats:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
