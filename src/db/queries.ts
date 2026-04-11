import { db } from "./index";
import { leads, leadSessions, videoEvents, emailLog, appConfig, pageViews } from "./schema";
import { eq, sql, desc, gte, lte, and, count } from "drizzle-orm";

export async function getAppConfig(key: string): Promise<string | null> {
  const row = await db.select().from(appConfig).where(eq(appConfig.key, key)).get();
  return row?.value ?? null;
}

export async function setAppConfig(key: string, value: string): Promise<void> {
  await db
    .insert(appConfig)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appConfig.key, set: { value, updatedAt: new Date() } });
}

export async function trackPageView(page: string, funnelId?: string | null): Promise<void> {
  await db.insert(pageViews).values({ page, funnelId: funnelId ?? null, createdAt: new Date() });
}

export async function getFunnelStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const landingVisitsRow = await db.select({ count: count() }).from(pageViews)
    .where(eq(pageViews.page, "landing")).get();

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
  const landing = landingVisitsRow?.count || 0;

  return {
    landingVisits: landing,
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

export async function getLeadsForExport(filters: {
  dateFrom?: string;
  dateTo?: string;
  minWatchMinutes?: number;
  funnelStage?: "all" | "vsl" | "cta_shown" | "cta_clicked";
  emailSent?: "all" | "yes" | "no";
}) {
  const conditions = [];
  if (filters.dateFrom) conditions.push(gte(leads.createdAt, new Date(filters.dateFrom)));
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(leads.createdAt, to));
  }

  const allLeads = await db
    .select({
      id: leads.id,
      fullName: leads.fullName,
      email: leads.email,
      createdAt: leads.createdAt,
      utmSource: leads.utmSource,
      utmMedium: leads.utmMedium,
      utmCampaign: leads.utmCampaign,
      utmContent: leads.utmContent,
      utmTerm: leads.utmTerm,
    })
    .from(leads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt))
    .all();

  const enriched = await Promise.all(
    allLeads.map(async (lead) => {
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
        maxWatchSeconds: session?.maxTimestampSec || 0,
        ctaShown: session?.ctaShown || false,
        ctaClicked: session?.ctaClicked || false,
        emailsSent: emailCount?.count || 0,
        hasSession: !!session,
      };
    })
  );

  return enriched.filter((lead) => {
    const minSec = (filters.minWatchMinutes || 0) * 60;
    if (lead.maxWatchSeconds < minSec) return false;

    if (filters.funnelStage === "vsl" && !lead.hasSession) return false;
    if (filters.funnelStage === "cta_shown" && !lead.ctaShown) return false;
    if (filters.funnelStage === "cta_clicked" && !lead.ctaClicked) return false;

    if (filters.emailSent === "yes" && lead.emailsSent === 0) return false;
    if (filters.emailSent === "no" && lead.emailsSent > 0) return false;

    return true;
  });
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
