CREATE TABLE `sri_catalogs` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_type` text NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_catalogs_type` ON `sri_catalogs` (`catalog_type`);--> statement-breakpoint
CREATE INDEX `idx_catalogs_type_code` ON `sri_catalogs` (`catalog_type`,`code`);