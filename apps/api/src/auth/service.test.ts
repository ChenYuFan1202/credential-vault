import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { users } from "../db/schema";
import { getUserByUsername } from "../users/service";
import { verifyPassword } from "./password";
import { changePassword, loginUser, registerUser } from "./service";

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

  test("logs in with correct username and password", async () => {
    await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    const result = await loginUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected login to succeed.");
    }

    expect(result.user.username).toBe("demo-user");
  });

  test("rejects an unknown username", async () => {
    const result = await loginUser({
      username: "missing-user",
      password: "fake-password-123",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected login to fail.");
    }

    expect(result.message).toBe("Invalid username or password.");
  });

  test("rejects an incorrect password", async () => {
    await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    const result = await loginUser({
      username: "demo-user",
      password: "wrong-password",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected login to fail.");
    }

    expect(result.message).toBe("Invalid username or password.");
  });

  test("trims login usernames", async () => {
    await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    const result = await loginUser({
      username: "  demo-user  ",
      password: "fake-password-123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected login to succeed.");
    }

    expect(result.user.username).toBe("demo-user");
  });

  test("does not return password hash when login succeeds", async () => {
    await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    const result = await loginUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    if (!result.success) {
      throw new Error("Expected login to succeed.");
    }

    expect("passwordHash" in result.user).toBe(false);
  });

  test("changes a user's password", async () => {
    const registerResult = await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    if (!registerResult.success) {
      throw new Error("Expected registration to succeed.");
    }

    const changeResult = await changePassword(registerResult.user.id, {
      currentPassword: "fake-password-123",
      newPassword: "new-fake-password-123",
    });
    const oldPasswordLoginResult = await loginUser({
      username: "demo-user",
      password: "fake-password-123",
    });
    const newPasswordLoginResult = await loginUser({
      username: "demo-user",
      password: "new-fake-password-123",
    });

    expect(changeResult.success).toBe(true);
    expect(oldPasswordLoginResult.success).toBe(false);
    expect(newPasswordLoginResult.success).toBe(true);
  });

  test("rejects password changes with an incorrect current password", async () => {
    const registerResult = await registerUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    if (!registerResult.success) {
      throw new Error("Expected registration to succeed.");
    }

    const changeResult = await changePassword(registerResult.user.id, {
      currentPassword: "wrong-password",
      newPassword: "new-fake-password-123",
    });
    const oldPasswordLoginResult = await loginUser({
      username: "demo-user",
      password: "fake-password-123",
    });

    expect(changeResult.success).toBe(false);

    if (changeResult.success) {
      throw new Error("Expected password change to fail.");
    }

    expect(changeResult.message).toBe("Current password is incorrect.");
    expect(oldPasswordLoginResult.success).toBe(true);
  });
});
