import { describe, expect, test } from "bun:test";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  test("hashes a password with argon2id", async () => {
    const passwordHash = await hashPassword("fake-password-123");

    expect(passwordHash).not.toBe("fake-password-123");
    expect(passwordHash).toStartWith("$argon2id$");
  });

  test("verifies the correct password", async () => {
    const passwordHash = await hashPassword("fake-password-123");

    const isValid = await verifyPassword("fake-password-123", passwordHash);

    expect(isValid).toBe(true);
  });

  test("rejects an incorrect password", async () => {
    const passwordHash = await hashPassword("fake-password-123");

    const isValid = await verifyPassword("wrong-password", passwordHash);

    expect(isValid).toBe(false);
  });
});
