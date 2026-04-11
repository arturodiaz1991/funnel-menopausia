export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { getAppConfig } from "@/db/queries";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import VSLClient from "./vsl-client";

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_VIDEO_URL ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const DEFAULT_SCHOOL_URL =
  process.env.NEXT_PUBLIC_SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad";

const DEFAULT_CTA_TIMESTAMP = parseInt(process.env.CTA_TIMESTAMP_SECONDS || "1500", 10);

export default async function VSLPage() {
  let videoUrl = DEFAULT_VIDEO_URL;
  let schoolUrl = DEFAULT_SCHOOL_URL;
  let ctaTimestamp = DEFAULT_CTA_TIMESTAMP;

  try {
    // Load global defaults from app_config
    const [dbVideoUrl, dbSchoolUrl, dbCtaTimestamp] = await Promise.all([
      getAppConfig("video_url"),
      getAppConfig("school_url"),
      getAppConfig("cta_timestamp_seconds"),
    ]);
    if (dbVideoUrl) videoUrl = dbVideoUrl;
    if (dbSchoolUrl) schoolUrl = dbSchoolUrl;
    if (dbCtaTimestamp) ctaTimestamp = parseInt(dbCtaTimestamp, 10) || DEFAULT_CTA_TIMESTAMP;

    // Override with funnel-specific config if visitor has an assigned funnel
    const cookieStore = await cookies();
    const funnelId = cookieStore.get("funnel_id")?.value;
    if (funnelId) {
      const funnel = await db.select().from(funnels).where(eq(funnels.id, funnelId)).get();
      if (funnel?.isActive) {
        const funnelConfig = JSON.parse(funnel.config || "{}");
        if (funnelConfig.video_url) videoUrl = funnelConfig.video_url;
        if (funnelConfig.school_url) schoolUrl = funnelConfig.school_url;
        if (funnelConfig.cta_timestamp_seconds)
          ctaTimestamp = parseInt(funnelConfig.cta_timestamp_seconds, 10) || ctaTimestamp;
      }
    }
  } catch {
    // Error de BD — usar valores por defecto
  }

  return <VSLClient videoUrl={videoUrl} schoolUrl={schoolUrl} ctaTimestamp={ctaTimestamp} />;
}
