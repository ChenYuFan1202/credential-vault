import postgres from "postgres";
import { getDatabaseUrl } from "./url";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to rebuild the database in production.");
}

const databaseUrl = getDatabaseUrl();

const client = postgres(databaseUrl, {
  max: 1,
});

await client`drop schema if exists public cascade`;
await client`drop schema if exists drizzle cascade`;
await client`create schema public`;
await client.end();

console.log("Database schema rebuilt.");
