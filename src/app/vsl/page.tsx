import { getAppConfig } from "@/db/queries";
import VSLClient from "./vsl-client";

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_VIDEO_URL ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default async function VSLPage() {
  const dbVideoUrl = await getAppConfig("video_url");
  const videoUrl = dbVideoUrl || DEFAULT_VIDEO_URL;

  return <VSLClient videoUrl={videoUrl} />;
}
