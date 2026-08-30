import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";

type User = typeof users.$inferSelect;

type CreateUserInput = {
  id?: string;
  username: string;
  passwordHash: string;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const now = new Date().toISOString();
  const [user] = await db
    .insert(users)
    .values({
      id: input.id ?? crypto.randomUUID(),
      username: input.username.trim(),
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (user === undefined) {
    throw new Error("User could not be created.");
  }

  return user;
}

export async function getUserByUsername(
  username: string,
): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.trim()));

  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));

  return user;
}

export async function updateUserPasswordHash(
  id: string,
  passwordHash: string,
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id))
    .returning();

  return user;
}
