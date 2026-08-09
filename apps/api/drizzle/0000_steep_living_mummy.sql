CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
