import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { users } from "../db/schema";
import { getUserByUsername } from "../users/service";
import { verifyPassword } from "./password";
import { registerUser } from "./service";

beforeEach(() => {
  db.delete(users).run();
});

describe("auth service", () => {
  test("registers a user", async () => {
    const result = await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected registration to succeed.");
    }

    expect(result.user.username).toBe("demo-user");
  });

  test("stores a password hash instead of plaintext", async () => {
    const result = await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    if (!result.success) {
      throw new Error("Expected registration to succeed.");
    }

    const user = getUserByUsername("demo-user");

    if (user === undefined) {
      throw new Error("Expected user to exist.");
    }

    expect(user.passwordHash).not.toBe("fake-password-123");
    expect(user.passwordHash).toStartWith("$argon2id$");
    expect(await verifyPassword("fake-password-123", user.passwordHash)).toBe(
      true,
    );
  });

  test("rejects duplicate usernames", async () => {
    await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    const result = await registerUser({
      username: "demo-user",
      password: "another-fake-password",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected registration to fail.");
    }

    expect(result.message).toBe("Username is already taken.");
  });

  test("trims usernames before storing", async () => {
    const result = await registerUser({
      username: "  demo-user  ",
      password: "fake-password-123",
    });

    if (!result.success) {
      throw new Error("Expected registration to succeed.");
    }

    expect(result.user.username).toBe("demo-user");
  });
});
