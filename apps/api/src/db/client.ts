import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseConnectionUrl } from "./url";

const databaseUrl = getDatabaseConnectionUrl();

export const queryClient = postgres(databaseUrl);

export const db = drizzle(queryClient, {
  schema,
});
