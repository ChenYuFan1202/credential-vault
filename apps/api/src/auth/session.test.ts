import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { createUser } from "../users/service";
import { hashPassword } from "./password";
import {
  createSession,
  deleteSessionByToken,
  getUserBySessionToken,
  hashSessionToken,
} from "./session";

let testUserId = "";

beforeEach(async () => {
  await db.delete(sessions);
  await db.delete(users);

  const user = await createUser({
    username: "session-test-user",
    passwordHash: await hashPassword("fake-password-123"),
  });

  testUserId = user.id;
});

describe("sessions", () => {
  test("creates a session and stores only the token hash", async () => {
    const session = await createSession(testUserId);
    const sessionTokenHash = hashSessionToken(session.sessionToken);
    const [storedSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, sessionTokenHash));

    expect(session.sessionToken).toBeString();
    expect(session.sessionToken).not.toBe(sessionTokenHash);
    expect(storedSession?.sessionTokenHash).toBe(sessionTokenHash);
    expect(storedSession?.sessionTokenHash).not.toBe(session.sessionToken);
  });

  test("returns the user for a valid session token", async () => {
    const session = await createSession(testUserId);

    const user = await getUserBySessionToken(session.sessionToken);

    expect(user?.id).toBe(testUserId);
    expect(user?.username).toBe("session-test-user");
  });

  test("returns null for an unknown session token", async () => {
    const user = await getUserBySessionToken("missing-session-token");

    expect(user).toBeNull();
  });

  test("deletes a session by token", async () => {
    const session = await createSession(testUserId);

    await deleteSessionByToken(session.sessionToken);

    const user = await getUserBySessionToken(session.sessionToken);

    expect(user).toBeNull();
  });

  test("deletes an expired session when encountered", async () => {
    const expiredToken = "expired-session-token";
    const expiredTokenHash = hashSessionToken(expiredToken);

    await db
      .insert(sessions)
      .values({
        id: crypto.randomUUID(),
        userId: testUserId,
        sessionTokenHash: expiredTokenHash,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        createdAt: new Date(Date.now() - 2000).toISOString(),
      });

    const user = await getUserBySessionToken(expiredToken);
    const [storedSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, expiredTokenHash));

    expect(user).toBeNull();
    expect(storedSession).toBeUndefined();
  });
});
