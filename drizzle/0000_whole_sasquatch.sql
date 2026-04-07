CREATE TABLE `email_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` text NOT NULL,
	`email_type` text NOT NULL,
	`template_key` text NOT NULL,
	`sent_at` integer DEFAULT (unixepoch()) NOT NULL,
	`resend_id` text,
	`status` text DEFAULT 'sent' NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_email_log_lead` ON `email_log` (`lead_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_email_log_unique` ON `email_log` (`lead_id`,`email_type`);--> statement-breakpoint
CREATE TABLE `lead_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_active_at` integer DEFAULT (unixepoch()) NOT NULL,
	`max_timestamp_sec` real DEFAULT 0 NOT NULL,
	`abandoned_at_sec` real,
	`cta_shown` integer DEFAULT false NOT NULL,
	`cta_clicked` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_lead` ON `lead_sessions` (`lead_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_content` text,
	`utm_term` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_email_unique` ON `leads` (`email`);--> statement-breakpoint
CREATE TABLE `video_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` text NOT NULL,
	`session_id` text NOT NULL,
	`event_type` text NOT NULL,
	`timestamp_sec` real NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_video_events_lead` ON `video_events` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_video_events_type` ON `video_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `idx_video_events_session` ON `video_events` (`session_id`);