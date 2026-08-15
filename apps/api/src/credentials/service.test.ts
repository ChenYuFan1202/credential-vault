import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { credentials, users } from "../db/schema";
import { createUser } from "../users/service";
import {
  createCredential,
  deleteCredential,
  getCredentialById,
  listCredentials,
  updateCredential,
} from "./service";

let testUserId = "";
let otherUserId = "";

beforeEach(() => {
  db.delete(credentials).run();
  db.delete(users).run();

  const testUser = createUser({
    username: "test-user",
    passwordHash: "fake-argon2id-hash-for-test",
  });
  const otherUser = createUser({
    username: "other-user",
    passwordHash: "fake-argon2id-hash-for-other-test",
  });

  testUserId = testUser.id;
  otherUserId = otherUser.id;
});

describe("credential service", () => {
  test("creates a credential", () => {
    const credential = createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    expect(credential.id).toBeString();
    expect(credential.platform).toBe("GitHub");
    expect(credential.username).toBe("demo-user");
    expect(credential.password).toBe("fake-password-123");
    expect(credential.notes).toBeNull();
  });

  test("lists credentials", () => {
    createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    createCredential(testUserId, {
      platform: "Gmail",
      username: "demo-mail-user",
      password: "fake-password-456",
    });

    const rows = listCredentials(testUserId);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.platform)).toContain("GitHub");
    expect(rows.map((row) => row.platform)).toContain("Gmail");
  });

  test("gets a credential by id", () => {
    const credential = createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const foundCredential = getCredentialById(testUserId, credential.id);

    expect(foundCredential?.id).toBe(credential.id);
  });

  test("updates a credential", () => {
    const credential = createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const updatedCredential = updateCredential(testUserId, credential.id, {
      platform: "GitHub Updated",
      notes: "Updated fake notes.",
    });

    expect(updatedCredential?.platform).toBe("GitHub Updated");
    expect(updatedCredential?.notes).toBe("Updated fake notes.");
    expect(updatedCredential?.username).toBe("demo-user");
  });

  test("deletes a credential", () => {
    const credential = createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const deleted = deleteCredential(testUserId, credential.id);
    const foundCredential = getCredentialById(testUserId, credential.id);

    expect(deleted).toBe(true);
    expect(foundCredential).toBeUndefined();
  });

  test("does not return another user's credential", () => {
    const credential = createCredential(otherUserId, {
      platform: "GitHub",
      username: "other-demo-user",
      password: "fake-password-123",
    });

    const foundCredential = getCredentialById(testUserId, credential.id);
    const rows = listCredentials(testUserId);

    expect(foundCredential).toBeUndefined();
    expect(rows).toHaveLength(0);
  });
});
