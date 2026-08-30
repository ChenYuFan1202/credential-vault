import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = Bun.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error("DATABASE_URL is required.");
}

const migrationClient = postgres(databaseUrl, {
  max: 1,
});
const db = drizzle(migrationClient);

await migrate(db, {
  migrationsFolder: "./drizzle",
});

await migrationClient.end();

console.log("Database migrations applied.");
