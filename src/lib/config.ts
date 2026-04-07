export const config = {
  ctaTimestampSeconds: parseInt(process.env.CTA_TIMESTAMP_SECONDS || "1500", 10),
  schoolCommunityUrl: process.env.SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  cronSecret: process.env.CRON_SECRET || "dev-cron-secret",
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY || "",
  abandonmentTimeoutMinutes: 30,
};
