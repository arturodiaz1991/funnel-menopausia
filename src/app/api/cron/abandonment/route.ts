import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leadSessions, leads, emailLog } from "@/db/schema";
import { eq, lt, and } from "drizzle-orm";
import { config } from "@/lib/config";
import { getAppConfig } from "@/db/queries";
import { sendEmail } from "@/lib/email";
import { emailTemplates, getAbandonmentTemplate } from "@/lib/email-templates";

async function runCron(request: NextRequest) {
  // Verify cron secret (Vercel crons send this automatically, or manually via POST)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${config.cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const dbTimeout = await getAppConfig("abandonment_timeout_minutes").catch(() => null);
    const timeoutMinutes = dbTimeout ? parseInt(dbTimeout, 10) || config.abandonmentTimeoutMinutes : config.abandonmentTimeoutMinutes;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const cutoff = new Date(Date.now() - timeoutMs);

    // Find abandoned sessions: inactive for > 30 min, not converted
    const abandonedSessions = await db
      .select({
        sessionId: leadSessions.id,
        leadId: leadSessions.leadId,
        abandonedAtSec: leadSessions.abandonedAtSec,
        maxTimestampSec: leadSessions.maxTimestampSec,
        ctaShown: leadSessions.ctaShown,
        ctaClicked: leadSessions.ctaClicked,
        fullName: leads.fullName,
        email: leads.email,
      })
      .from(leadSessions)
      .innerJoin(leads, eq(leadSessions.leadId, leads.id))
      .where(
        and(
          lt(leadSessions.lastActiveAt, cutoff),
          eq(leadSessions.ctaClicked, false)
        )
      )
      .all();

    let emailsSent = 0;
    let errors = 0;

    for (const session of abandonedSessions) {
      const abandonedAt = session.abandonedAtSec ?? session.maxTimestampSec;
      const dbCta = await getAppConfig("cta_timestamp_seconds").catch(() => null);
      const ctaTimestamp = dbCta ? parseInt(dbCta, 10) || config.ctaTimestampSeconds : config.ctaTimestampSeconds;
      const templateKey = getAbandonmentTemplate(
        abandonedAt,
        ctaTimestamp,
        session.ctaShown,
        session.ctaClicked
      );

      if (!templateKey) continue;

      // Check if this email type was already sent to this lead
      const existingEmail = await db
        .select()
        .from(emailLog)
        .where(
          and(
            eq(emailLog.leadId, session.leadId),
            eq(emailLog.emailType, templateKey)
          )
        )
        .get();

      if (existingEmail) continue;

      const template = emailTemplates[templateKey];
      if (!template) continue;

      const resendId = await sendEmail({
        to: session.email,
        subject: template.subject,
        html: template.html(session.fullName),
      });

      if (resendId) {
        await db.insert(emailLog).values({
          leadId: session.leadId,
          emailType: templateKey,
          templateKey,
          resendId,
        });
        emailsSent++;
      } else {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: abandonedSessions.length,
      emailsSent,
      errors,
    });
  } catch (error) {
    console.error("Error processing abandonment cron:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Vercel crons use GET; manual trigger uses POST
export const GET = runCron;
export const POST = runCron;
