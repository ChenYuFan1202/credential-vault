CREATE TABLE "credential_custom_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"credential_id" text NOT NULL,
	"label_encrypted" text NOT NULL,
	"label_nonce" text NOT NULL,
	"value_encrypted" text NOT NULL,
	"value_nonce" text NOT NULL,
	"crypto_version" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"username_encrypted" text NOT NULL,
	"username_nonce" text NOT NULL,
	"password_encrypted" text NOT NULL,
	"password_nonce" text NOT NULL,
	"notes_encrypted" text,
	"notes_nonce" text,
	"crypto_version" integer NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "sessions_session_token_hash_unique" UNIQUE("session_token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "credential_custom_fields" ADD CONSTRAINT "credential_custom_fields_credential_id_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."credentials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;