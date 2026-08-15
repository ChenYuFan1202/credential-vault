import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";

type CreateUserInput = {
  id?: string;
  username: string;
  passwordHash: string;
};

export function createUser(input: CreateUserInput) {
  const now = new Date().toISOString();

  return db
    .insert(users)
    .values({
      id: input.id ?? crypto.randomUUID(),
      username: input.username.trim(),
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export function getUserByUsername(username: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.username, username.trim()))
    .get();
}
