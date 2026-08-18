import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { createUser } from "../users/service";
import {
  createSession,
  deleteSessionByToken,
  getUserBySessionToken,
  hashSessionToken,
} from "./session";

let testUserId = "";

beforeEach(() => {
  db.delete(sessions).run();
  db.delete(users).run();

  const user = createUser({
    username: "session-test-user",
    passwordHash: "fake-argon2id-hash-for-session-test",
  });

  testUserId = user.id;
});

describe("sessions", () => {
  test("creates a session and stores only the token hash", () => {
    const session = createSession(testUserId);
    const sessionTokenHash = hashSessionToken(session.sessionToken);
    const storedSession = db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, sessionTokenHash))
      .get();

    expect(session.sessionToken).toBeString();
    expect(session.sessionToken).not.toBe(sessionTokenHash);
    expect(storedSession?.sessionTokenHash).toBe(sessionTokenHash);
    expect(storedSession?.sessionTokenHash).not.toBe(session.sessionToken);
  });

  test("returns the user for a valid session token", () => {
    const session = createSession(testUserId);

    const user = getUserBySessionToken(session.sessionToken);

    expect(user?.id).toBe(testUserId);
    expect(user?.username).toBe("session-test-user");
  });

  test("returns null for an unknown session token", () => {
    const user = getUserBySessionToken("missing-session-token");

    expect(user).toBeNull();
  });

  test("deletes a session by token", () => {
    const session = createSession(testUserId);

    deleteSessionByToken(session.sessionToken);

    const user = getUserBySessionToken(session.sessionToken);

    expect(user).toBeNull();
  });

  test("deletes an expired session when encountered", () => {
    const expiredToken = "expired-session-token";
    const expiredTokenHash = hashSessionToken(expiredToken);

    db.insert(sessions)
      .values({
        id: crypto.randomUUID(),
        userId: testUserId,
        sessionTokenHash: expiredTokenHash,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        createdAt: new Date(Date.now() - 2000).toISOString(),
      })
      .run();

    const user = getUserBySessionToken(expiredToken);
    const storedSession = db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, expiredTokenHash))
      .get();

    expect(user).toBeNull();
    expect(storedSession).toBeUndefined();
  });
});
