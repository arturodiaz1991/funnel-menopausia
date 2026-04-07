import { db } from "./index";
import { leads, leadSessions, videoEvents, emailLog } from "./schema";
import { eq, sql, desc, gte, and, count } from "drizzle-orm";

export async function getFunnelStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const totalLeads = await db.select({ count: count() }).from(leads).get();
  const leadsToday = await db.select({ count: count() }).from(leads)
    .where(gte(leads.createdAt, todayStart)).get();
  const leadsThisWeek = await db.select({ count: count() }).from(leads)
    .where(gte(leads.createdAt, weekStart)).get();

  const totalSessions = await db.select({ count: count() }).from(leadSessions).get();
  const avgWatchTime = await db.select({
    avg: sql<number>`avg(${leadSessions.maxTimestampSec})`,
  }).from(leadSessions).get();

  const ctaShownCount = await db.select({ count: count() }).from(leadSessions)
    .where(eq(leadSessions.ctaShown, true)).get();
  const ctaClickedCount = await db.select({ count: count() }).from(leadSessions)
    .where(eq(leadSessions.ctaClicked, true)).get();

  const total = totalLeads?.count || 0;
  const sessions = totalSessions?.count || 0;

  return {
    totalLeads: total,
    leadsToday: leadsToday?.count || 0,
    leadsThisWeek: leadsThisWeek?.count || 0,
    vslViewRate: total > 0 ? (sessions / total) * 100 : 0,
    avgWatchTimeSec: avgWatchTime?.avg || 0,
    ctaShowRate: sessions > 0 ? ((ctaShownCount?.count || 0) / sessions) * 100 : 0,
    ctaClickRate: sessions > 0 ? ((ctaClickedCount?.count || 0) / sessions) * 100 : 0,
  };
}

export async function getLeadsWithStats(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const result = await db
    .select({
      id: leads.id,
      fullName: leads.fullName,
      email: leads.email,
      createdAt: leads.createdAt,
      utmSource: leads.utmSource,
      utmCampaign: leads.utmCampaign,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(pageSize)
    .offset(offset)
    .all();

  const leadsWithStats = await Promise.all(
    result.map(async (lead) => {
      const session = await db
        .select({
          maxTimestampSec: leadSessions.maxTimestampSec,
          ctaShown: leadSessions.ctaShown,
          ctaClicked: leadSessions.ctaClicked,
        })
        .from(leadSessions)
        .where(eq(leadSessions.leadId, lead.id))
        .orderBy(desc(leadSessions.maxTimestampSec))
        .limit(1)
        .get();

      const emailCount = await db
        .select({ count: count() })
        .from(emailLog)
        .where(eq(emailLog.leadId, lead.id))
        .get();

      return {
        ...lead,
        maxWatchTime: session?.maxTimestampSec || 0,
        ctaShown: session?.ctaShown || false,
        ctaClicked: session?.ctaClicked || false,
        emailsSent: emailCount?.count || 0,
      };
    })
  );

  const totalCount = await db.select({ count: count() }).from(leads).get();

  return {
    leads: leadsWithStats,
    totalCount: totalCount?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalCount?.count || 0) / pageSize),
  };
}

export async function getLeadDetail(leadId: string) {
  const lead = await db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!lead) return null;

  const sessions = await db
    .select()
    .from(leadSessions)
    .where(eq(leadSessions.leadId, leadId))
    .orderBy(desc(leadSessions.startedAt))
    .all();

  const events = await db
    .select()
    .from(videoEvents)
    .where(eq(videoEvents.leadId, leadId))
    .orderBy(videoEvents.createdAt)
    .all();

  const emails = await db
    .select()
    .from(emailLog)
    .where(eq(emailLog.leadId, leadId))
    .orderBy(desc(emailLog.sentAt))
    .all();

  return { lead, sessions, events, emails };
}

export async function getHeatmapData(bucketSizeSeconds = 5) {
  const totalLeadsWithSessions = await db
    .select({ count: sql<number>`count(distinct ${leadSessions.leadId})` })
    .from(leadSessions)
    .get();

  const totalViewers = totalLeadsWithSessions?.count || 0;
  if (totalViewers === 0) return [];

  const buckets = await db
    .select({
      bucket: sql<number>`cast(${videoEvents.timestampSec} / ${bucketSizeSeconds} as integer) * ${bucketSizeSeconds}`,
      viewerCount: sql<number>`count(distinct ${videoEvents.leadId})`,
    })
    .from(videoEvents)
    .where(eq(videoEvents.eventType, "timeupdate"))
    .groupBy(sql`cast(${videoEvents.timestampSec} / ${bucketSizeSeconds} as integer)`)
    .orderBy(sql`cast(${videoEvents.timestampSec} / ${bucketSizeSeconds} as integer)`)
    .all();

  return buckets.map((b) => ({
    second: b.bucket,
    viewerCount: b.viewerCount,
    viewerPercent: (b.viewerCount / totalViewers) * 100,
  }));
}
