import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { credentials } from "../db/schema";
import type {
  CreateCredentialInput,
  UpdateCredentialInput,
} from "./validation";

export function listCredentials(userId: string) {
  return db
    .select()
    .from(credentials)
    .where(eq(credentials.userId, userId))
    .all();
}

export function createCredential(userId: string, input: CreateCredentialInput) {
  const now = new Date().toISOString();

  return db
    .insert(credentials)
    .values({
      id: crypto.randomUUID(),
      userId,
      platform: input.platform.trim(),
      username: input.username.trim(),
      password: input.password,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export function getCredentialById(userId: string, id: string) {
  return db
    .select()
    .from(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .get();
}

export function updateCredential(
  userId: string,
  id: string,
  input: UpdateCredentialInput,
) {
  const values: Partial<typeof credentials.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.platform !== undefined) {
    values.platform = input.platform.trim();
  }

  if (input.username !== undefined) {
    values.username = input.username.trim();
  }

  if (input.password !== undefined) {
    values.password = input.password;
  }

  if (input.notes !== undefined) {
    values.notes = input.notes?.trim() || null;
  }

  return db
    .update(credentials)
    .set(values)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .returning()
    .get();
}

export function deleteCredential(userId: string, id: string): boolean {
  const deletedCredential = db
    .delete(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .returning()
    .get();

  return deletedCredential !== undefined;
}
