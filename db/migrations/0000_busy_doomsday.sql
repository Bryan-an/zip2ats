CREATE TABLE `ats_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`periodo` text NOT NULL,
	`tipo_reporte` text NOT NULL,
	`document_ids` text NOT NULL,
	`total_documents` integer NOT NULL,
	`formato` text NOT NULL,
	`r2_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`generated_at` integer NOT NULL,
	`downloaded_at` integer,
	`expires_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reports_organization` ON `ats_reports` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_reports_periodo` ON `ats_reports` (`periodo`);--> statement-breakpoint
CREATE INDEX `idx_reports_generated_at` ON `ats_reports` (`generated_at`);--> statement-breakpoint
CREATE INDEX `idx_reports_org_periodo` ON `ats_reports` (`organization_id`,`periodo`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`user_id` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_audit_organization` ON `audit_logs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_created_at` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`tipo_documento` text NOT NULL,
	`numero_autorizacion` text,
	`clave_acceso` text,
	`emisor_ruc` text NOT NULL,
	`emisor_razon_social` text,
	`receptor_identificacion` text,
	`receptor_tipo_identificacion` text,
	`receptor_razon_social` text,
	`fecha_emision` text NOT NULL,
	`fecha_autorizacion` text,
	`subtotal_sin_impuestos` integer NOT NULL,
	`subtotal_iva_0` integer DEFAULT 0 NOT NULL,
	`subtotal_iva_12` integer DEFAULT 0 NOT NULL,
	`subtotal_iva_15` integer DEFAULT 0 NOT NULL,
	`iva` integer DEFAULT 0 NOT NULL,
	`ice` integer DEFAULT 0 NOT NULL,
	`irbpnr` integer DEFAULT 0 NOT NULL,
	`propina` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`retencion_iva` integer DEFAULT 0 NOT NULL,
	`retencion_renta` integer DEFAULT 0 NOT NULL,
	`forma_pago` text,
	`xml_original_r2_key` text,
	`xml_hash` text,
	`procesamiento_status` text DEFAULT 'success' NOT NULL,
	`procesamiento_errores` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `upload_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_documents_batch` ON `documents` (`batch_id`);--> statement-breakpoint
CREATE INDEX `idx_documents_organization` ON `documents` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_documents_tipo` ON `documents` (`tipo_documento`);--> statement-breakpoint
CREATE INDEX `idx_documents_fecha_emision` ON `documents` (`fecha_emision`);--> statement-breakpoint
CREATE INDEX `idx_documents_clave_acceso` ON `documents` (`clave_acceso`);--> statement-breakpoint
CREATE INDEX `idx_documents_hash` ON `documents` (`xml_hash`);--> statement-breakpoint
CREATE INDEX `idx_documents_emisor_ruc` ON `documents` (`emisor_ruc`);--> statement-breakpoint
CREATE INDEX `idx_documents_org_fecha` ON `documents` (`organization_id`,`fecha_emision`);--> statement-breakpoint
CREATE TABLE `organization_settings` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`auto_process_uploads` integer DEFAULT true NOT NULL,
	`duplicate_detection` integer DEFAULT true NOT NULL,
	`default_report_format` text DEFAULT 'xlsx' NOT NULL,
	`include_notes_in_ats` integer DEFAULT true NOT NULL,
	`email_on_process_complete` integer DEFAULT true NOT NULL,
	`email_on_process_error` integer DEFAULT true NOT NULL,
	`notification_email` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ruc` text NOT NULL,
	`email` text NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`max_monthly_documents` integer DEFAULT 100 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_ruc_unique` ON `organizations` (`ruc`);--> statement-breakpoint
CREATE INDEX `idx_organizations_ruc` ON `organizations` (`ruc`);--> statement-breakpoint
CREATE INDEX `idx_organizations_status` ON `organizations` (`status`);--> statement-breakpoint
CREATE TABLE `sri_catalogs` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_type` text NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_catalogs_type` ON `sri_catalogs` (`catalog_type`);--> statement-breakpoint
CREATE INDEX `idx_catalogs_type_code` ON `sri_catalogs` (`catalog_type`,`code`);--> statement-breakpoint
CREATE TABLE `upload_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`original_filename` text NOT NULL,
	`file_size` integer NOT NULL,
	`r2_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_files` integer DEFAULT 0 NOT NULL,
	`processed_files` integer DEFAULT 0 NOT NULL,
	`failed_files` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`uploaded_at` integer NOT NULL,
	`processed_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_batches_organization` ON `upload_batches` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_batches_status` ON `upload_batches` (`status`);--> statement-breakpoint
CREATE INDEX `idx_batches_uploaded_at` ON `upload_batches` (`uploaded_at`);--> statement-breakpoint
CREATE INDEX `idx_batches_org_status_date` ON `upload_batches` (`organization_id`,`status`,`uploaded_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`auth_provider_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_organization` ON `users` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);