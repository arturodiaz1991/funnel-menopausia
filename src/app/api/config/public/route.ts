import { NextResponse } from "next/server";
import { getAppConfig } from "@/db/queries";

// Claves que se pueden exponer públicamente (sin auth)
const PUBLIC_KEYS = ["privacy_url", "privacy_link_text"] as const;

export async function GET() {
  try {
    const result: Record<string, string | null> = {};
    for (const key of PUBLIC_KEYS) {
      result[key] = await getAppConfig(key);
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ privacy_url: null, privacy_link_text: null });
  }
}
