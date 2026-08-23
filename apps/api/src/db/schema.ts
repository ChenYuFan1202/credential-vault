import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  sessionTokenHash: text("session_token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const credentials = sqliteTable("credentials", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  platform: text("platform").notNull(),
  usernameEncrypted: text("username_encrypted").notNull(),
  usernameNonce: text("username_nonce").notNull(),
  passwordEncrypted: text("password_encrypted").notNull(),
  passwordNonce: text("password_nonce").notNull(),
  notesEncrypted: text("notes_encrypted"),
  notesNonce: text("notes_nonce"),
  cryptoVersion: integer("crypto_version").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const credentialCustomFields = sqliteTable("credential_custom_fields", {
  id: text("id").primaryKey(),
  credentialId: text("credential_id")
    .notNull()
    .references(() => credentials.id),
  labelEncrypted: text("label_encrypted").notNull(),
  labelNonce: text("label_nonce").notNull(),
  valueEncrypted: text("value_encrypted").notNull(),
  valueNonce: text("value_nonce").notNull(),
  cryptoVersion: integer("crypto_version").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
