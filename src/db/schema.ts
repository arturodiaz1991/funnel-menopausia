import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const funnels = sqliteTable("funnels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  config: text("config").notNull().default("{}"), // JSON: landing_headline, landing_subheadline, landing_cta_text, video_url, cta_timestamp_seconds, school_url
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  funnelId: text("funnel_id"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const videoEvents = sqliteTable("video_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: text("lead_id").notNull().references(() => leads.id),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(), // play, pause, seek_back, timeupdate, ended, cta_shown, cta_clicked, page_leave
  timestampSec: real("timestamp_sec").notNull(),
  metadata: text("metadata"), // JSON string for extra context
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index("idx_video_events_lead").on(table.leadId),
  index("idx_video_events_type").on(table.eventType),
  index("idx_video_events_session").on(table.sessionId),
]);

export const leadSessions = sqliteTable("lead_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  leadId: text("lead_id").notNull().references(() => leads.id),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  maxTimestampSec: real("max_timestamp_sec").notNull().default(0),
  abandonedAtSec: real("abandoned_at_sec"),
  ctaShown: integer("cta_shown", { mode: "boolean" }).notNull().default(false),
  ctaClicked: integer("cta_clicked", { mode: "boolean" }).notNull().default(false),
}, (table) => [
  index("idx_sessions_lead").on(table.leadId),
]);

export const appConfig = sqliteTable("app_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const pageViews = sqliteTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  page: text("page").notNull(), // 'landing', 'vsl', etc.
  funnelId: text("funnel_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index("idx_page_views_page").on(table.page),
  index("idx_page_views_created").on(table.createdAt),
]);

export const emailLog = sqliteTable("email_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: text("lead_id").notNull().references(() => leads.id),
  emailType: text("email_type").notNull(), // welcome, abandonment_bounce, abandonment_early, abandonment_middle, abandonment_pre_cta, abandonment_no_click
  templateKey: text("template_key").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  resendId: text("resend_id"),
  status: text("status").notNull().default("sent"), // sent, delivered, opened, clicked, failed
}, (table) => [
  index("idx_email_log_lead").on(table.leadId),
  uniqueIndex("idx_email_log_unique").on(table.leadId, table.emailType),
]);
