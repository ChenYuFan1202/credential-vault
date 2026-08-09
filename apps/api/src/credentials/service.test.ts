import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { credentials } from "../db/schema";
import {
  createCredential,
  deleteCredential,
  getCredentialById,
  listCredentials,
  updateCredential,
} from "./service";

beforeEach(() => {
  db.delete(credentials).run();
});

describe("credential service", () => {
  test("creates a credential", () => {
    const credential = createCredential({
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
    createCredential({
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    createCredential({
      platform: "Gmail",
      username: "demo-mail-user",
      password: "fake-password-456",
    });

    const rows = listCredentials();

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.platform)).toContain("GitHub");
    expect(rows.map((row) => row.platform)).toContain("Gmail");
  });

  test("gets a credential by id", () => {
    const credential = createCredential({
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const foundCredential = getCredentialById(credential.id);

    expect(foundCredential?.id).toBe(credential.id);
  });

  test("updates a credential", () => {
    const credential = createCredential({
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const updatedCredential = updateCredential(credential.id, {
      platform: "GitHub Updated",
      notes: "Updated fake notes.",
    });

    expect(updatedCredential?.platform).toBe("GitHub Updated");
    expect(updatedCredential?.notes).toBe("Updated fake notes.");
    expect(updatedCredential?.username).toBe("demo-user");
  });

  test("deletes a credential", () => {
    const credential = createCredential({
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const deleted = deleteCredential(credential.id);
    const foundCredential = getCredentialById(credential.id);

    expect(deleted).toBe(true);
    expect(foundCredential).toBeUndefined();
  });
});
