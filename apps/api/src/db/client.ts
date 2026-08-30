import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = Bun.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error("DATABASE_URL is required.");
}

export const queryClient = postgres(databaseUrl);

export const db = drizzle(queryClient, {
  schema,
});
