export const dynamic = "force-dynamic";

import { getAppConfig } from "@/db/queries";
import VSLClient from "./vsl-client";

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_VIDEO_URL ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const DEFAULT_SCHOOL_URL =
  process.env.NEXT_PUBLIC_SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad";

export default async function VSLPage() {
  let videoUrl = DEFAULT_VIDEO_URL;
  let schoolUrl = DEFAULT_SCHOOL_URL;
  try {
    const [dbVideoUrl, dbSchoolUrl] = await Promise.all([
      getAppConfig("video_url"),
      getAppConfig("school_url"),
    ]);
    if (dbVideoUrl) videoUrl = dbVideoUrl;
    if (dbSchoolUrl) schoolUrl = dbSchoolUrl;
  } catch {
    // tabla aún no existe o error de BD — usar valores por defecto
  }

  return <VSLClient videoUrl={videoUrl} schoolUrl={schoolUrl} />;
}
