CREATE TABLE `funnels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `funnel_id` text;--> statement-breakpoint
ALTER TABLE `page_views` ADD `funnel_id` text;