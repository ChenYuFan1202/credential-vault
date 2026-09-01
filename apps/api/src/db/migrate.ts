import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getDatabaseConnectionUrl } from "./url";

const databaseUrl = getDatabaseConnectionUrl();

const migrationClient = postgres(databaseUrl, {
  max: 1,
});
const db = drizzle(migrationClient);

await migrate(db, {
  migrationsFolder: "./drizzle",
});

await migrationClient.end();

console.log("Database migrations applied.");
