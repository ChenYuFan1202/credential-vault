import { db, queryClient } from "./client";
import {
  credentialCustomFields,
  credentials,
  sessions,
  users,
} from "./schema";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to delete database table data in production.");
}

try {
  await db.delete(credentialCustomFields);
  await db.delete(credentials);
  await db.delete(sessions);
  await db.delete(users);

  console.log("Database table data deleted.");
} finally {
  await queryClient.end();
}
