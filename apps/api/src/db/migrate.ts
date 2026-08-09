import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const sqlite = new Database("credential-vault.sqlite");
const db = drizzle(sqlite);

migrate(db, {
  migrationsFolder: "./drizzle",
});

sqlite.close();

console.log("Database migrations applied.");