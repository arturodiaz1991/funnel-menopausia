import { NextRequest, NextResponse } from "next/server";
import { getAppConfig, setAppConfig } from "@/db/queries";
import { config } from "@/lib/config";

const ALLOWED_KEYS = ["video_url", "fb_pixel_id", "school_url", "privacy_url", "privacy_link_text", "cookie_banner_enabled", "contact_email", "skip_landing", "cta_timestamp_seconds", "abandonment_timeout_minutes"] as const;

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result: Record<string, string | null> = {};
  for (const key of ALLOWED_KEYS) {
    result[key] = await getAppConfig(key);
  }

  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const key = body.key as string;
  const value = body.value as string;

  if (!ALLOWED_KEYS.includes(key as typeof ALLOWED_KEYS[number])) {
    return NextResponse.json({ error: "Clave no permitida" }, { status: 400 });
  }

  if (typeof value !== "string") {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  await setAppConfig(key, value.trim());
  return NextResponse.json({ ok: true });
}
