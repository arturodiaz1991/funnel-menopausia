export const dynamic = "force-dynamic";

import { getAppConfig } from "@/db/queries";
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
    const [dbVideoUrl, dbSchoolUrl, dbCtaTimestamp] = await Promise.all([
      getAppConfig("video_url"),
      getAppConfig("school_url"),
      getAppConfig("cta_timestamp_seconds"),
    ]);
    if (dbVideoUrl) videoUrl = dbVideoUrl;
    if (dbSchoolUrl) schoolUrl = dbSchoolUrl;
    if (dbCtaTimestamp) ctaTimestamp = parseInt(dbCtaTimestamp, 10) || DEFAULT_CTA_TIMESTAMP;
  } catch {
    // tabla aún no existe o error de BD — usar valores por defecto
  }

  return <VSLClient videoUrl={videoUrl} schoolUrl={schoolUrl} ctaTimestamp={ctaTimestamp} />;
}
