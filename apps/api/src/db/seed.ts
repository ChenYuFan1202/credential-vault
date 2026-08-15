import { createCredential } from "../credentials/service";
import { db } from "./client";
import { credentials, users } from "./schema";
import { createUser } from "../users/service";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed credential data in production.");
}

db.delete(credentials).run();
db.delete(users).run();

const demoUser = createUser({
  id: "demo-user-id",
  username: "demo-user",
  passwordHash: "fake-argon2id-hash-for-seed",
});

createCredential(demoUser.id, {
  platform: "GitHub",
  username: "demo-user",
  password: "fake-password-123",
});

createCredential(demoUser.id, {
  platform: "Gmail",
  username: "demo-mail-user",
  password: "fake-password-456",
  notes: "Fake email account for practice.",
});

console.log("Credential table seeded.");
