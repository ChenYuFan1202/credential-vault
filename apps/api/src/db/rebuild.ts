import { existsSync, unlinkSync } from "node:fs";

const databaseUrl = Bun.env.DATABASE_URL ?? "credential-vault.sqlite";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to rebuild the database in production.");
}

if (!databaseUrl.endsWith(".sqlite")) {
  throw new Error("Refusing to rebuild a non-SQLite database file.");
}

if (existsSync(databaseUrl)) {
  unlinkSync(databaseUrl);
  console.log(`Deleted ${databaseUrl}.`);
} else {
  console.log(`${databaseUrl} does not exist.`);
}
