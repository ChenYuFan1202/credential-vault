import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

type PublicUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type CreatedSession = {
  sessionToken: string;
  expiresAt: string;
};

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return Buffer.from(bytes).toString("base64url");
}

export function hashSessionToken(sessionToken: string): string {
  const data = new TextEncoder().encode(sessionToken);

  return Bun.CryptoHasher.hash("sha256", data, "hex");
}

export function createSession(userId: string): CreatedSession {
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDurationMs).toISOString();

  db.insert(sessions)
    .values({
      id: crypto.randomUUID(),
      userId,
      sessionTokenHash,
      expiresAt,
      createdAt: now.toISOString(),
    })
    .run();

  return {
    sessionToken,
    expiresAt,
  };
}

export function getUserBySessionToken(
  sessionToken: string,
): PublicUser | null {
  const sessionTokenHash = hashSessionToken(sessionToken);
  const session = db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionTokenHash, sessionTokenHash))
    .get();

  if (session === undefined) {
    return null;
  }

  if (session.expiresAt <= new Date().toISOString()) {
    deleteSessionByToken(sessionToken);
    return null;
  }

  const user = db.select().from(users).where(eq(users.id, session.userId)).get();

  if (user === undefined) {
    return null;
  }

  return toPublicUser(user);
}

export function deleteSessionByToken(sessionToken: string): void {
  const sessionTokenHash = hashSessionToken(sessionToken);

  db.delete(sessions)
    .where(eq(sessions.sessionTokenHash, sessionTokenHash))
    .run();
}
