import { createCredential } from "../credentials/service";
import { hashPassword } from "../auth/password";
import { db } from "./client";
import {
  credentialCustomFields,
  credentials,
  sessions,
  users,
} from "./schema";
import { createUser } from "../users/service";

if (Bun.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed credential data in production.");
}

await db.delete(credentialCustomFields);
await db.delete(credentials);
await db.delete(sessions);
await db.delete(users);

const demoUser = await createUser({
  username: "demo-user",
  passwordHash: await hashPassword("fake-password-123"),
});

await createCredential(demoUser.id, {
  platform: "GitHub",
  username: "demo-user",
  password: "fake-password-123",
  customFields: [
    {
      label: "Recovery Code",
      value: "fake-recovery-code-123",
    },
  ],
});

await createCredential(demoUser.id, {
  platform: "Gmail",
  username: "demo-mail-user",
  password: "fake-password-456",
  notes: "Fake email account for practice.",
  customFields: [
    {
      label: "Backup Email",
      value: "fake-backup@example.test",
    },
    {
      label: "PIN",
      value: "123456",
    },
  ],
});

console.log("Database seeded.");
