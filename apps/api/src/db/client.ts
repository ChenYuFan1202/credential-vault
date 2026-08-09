import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const databaseUrl = Bun.env.DATABASE_URL ?? "credential-vault.sqlite";
const sqlite = new Database(databaseUrl);

export const db = drizzle(sqlite, {
  schema,
});
