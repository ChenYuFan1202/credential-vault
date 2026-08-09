import { db } from "./client";
import { credentials } from "./schema";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to delete credential data in production.");
}

db.delete(credentials).run();

console.log("Credential table data deleted.");
