import { jwtVerify } from "jose";
import { config } from "./config";
import { NextRequest } from "next/server";

export async function getLeadIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("lead_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return (payload.leadId as string) || null;
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === config.adminPassword;
}
