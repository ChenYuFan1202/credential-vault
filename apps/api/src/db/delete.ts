import { db } from "./client";
import { credentials, sessions, users } from "./schema";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to delete database table data in production.");
}

db.delete(credentials).run();
db.delete(sessions).run();
db.delete(users).run();

console.log("Database table data deleted.");
