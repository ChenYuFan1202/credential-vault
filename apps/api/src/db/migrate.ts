import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const databaseUrl = Bun.env.DATABASE_URL ?? "credential-vault.sqlite";
const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite);

migrate(db, {
  migrationsFolder: "./drizzle",
});

sqlite.close();

console.log("Database migrations applied.");
