import { createCredential } from "../credentials/service";
import { db } from "./client";
import { credentials } from "./schema";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed credential data in production.");
}

db.delete(credentials).run();

createCredential({
  platform: "GitHub",
  username: "demo-user",
  password: "fake-password-123",
});

createCredential({
  platform: "Gmail",
  username: "demo-mail-user",
  password: "fake-password-456",
  notes: "Fake email account for practice.",
});

console.log("Credential table seeded.");
