export const dynamic = "force-dynamic";

import { getAppConfig } from "@/db/queries";
import VSLClient from "./vsl-client";

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_VIDEO_URL ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default async function VSLPage() {
  let videoUrl = DEFAULT_VIDEO_URL;
  try {
    const dbVideoUrl = await getAppConfig("video_url");
    if (dbVideoUrl) videoUrl = dbVideoUrl;
  } catch {
    // tabla aún no existe o error de BD — usar URL por defecto
  }

  return <VSLClient videoUrl={videoUrl} />;
}
