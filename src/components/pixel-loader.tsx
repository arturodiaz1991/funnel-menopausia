import { getAppConfig } from "@/db/queries";
import FacebookPixel from "./facebook-pixel";

export default async function PixelLoader() {
  let pixelId: string | undefined;
  try {
    const dbPixelId = await getAppConfig("fb_pixel_id");
    if (dbPixelId) pixelId = dbPixelId;
  } catch {
    // DB no disponible — usar env var como fallback (lo hace FacebookPixel internamente)
  }
  return <FacebookPixel pixelId={pixelId} />;
}
