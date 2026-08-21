ALTER TABLE `credentials` ADD `username_encrypted` text NOT NULL;--> statement-breakpoint
ALTER TABLE `credentials` ADD `username_nonce` text NOT NULL;--> statement-breakpoint
ALTER TABLE `credentials` ADD `password_encrypted` text NOT NULL;--> statement-breakpoint
ALTER TABLE `credentials` ADD `password_nonce` text NOT NULL;--> statement-breakpoint
ALTER TABLE `credentials` ADD `notes_encrypted` text;--> statement-breakpoint
ALTER TABLE `credentials` ADD `notes_nonce` text;--> statement-breakpoint
ALTER TABLE `credentials` ADD `crypto_version` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `credentials` DROP COLUMN `username`;--> statement-breakpoint
ALTER TABLE `credentials` DROP COLUMN `password`;--> statement-breakpoint
ALTER TABLE `credentials` DROP COLUMN `notes`;