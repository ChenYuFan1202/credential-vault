import postgres from "postgres";

const databaseUrl = Bun.env.DATABASE_URL;

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to rebuild the database in production.");
}

if (databaseUrl === undefined) {
  throw new Error("DATABASE_URL is required.");
}

const client = postgres(databaseUrl, {
  max: 1,
});

await client`drop schema if exists public cascade`;
await client`create schema public`;
await client.end();

console.log("Database schema rebuilt.");
