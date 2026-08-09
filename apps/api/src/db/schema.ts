import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const credentials = sqliteTable("credentials", {
  id: text("id").primaryKey(),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
