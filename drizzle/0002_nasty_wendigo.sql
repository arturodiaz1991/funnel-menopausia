CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_page_views_page` ON `page_views` (`page`);--> statement-breakpoint
CREATE INDEX `idx_page_views_created` ON `page_views` (`created_at`);