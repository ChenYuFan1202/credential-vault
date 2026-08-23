CREATE TABLE `credential_custom_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`credential_id` text NOT NULL,
	`label_encrypted` text NOT NULL,
	`label_nonce` text NOT NULL,
	`value_encrypted` text NOT NULL,
	`value_nonce` text NOT NULL,
	`crypto_version` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`credential_id`) REFERENCES `credentials`(`id`) ON UPDATE no action ON DELETE no action
);
