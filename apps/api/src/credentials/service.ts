import { and, eq } from "drizzle-orm";
import {
  decryptString,
  encryptString,
  type EncryptedValue,
} from "../crypto/service";
import { db } from "../db/client";
import { credentials } from "../db/schema";
import type {
  CreateCredentialInput,
  UpdateCredentialInput,
} from "./validation";

type CredentialRow = typeof credentials.$inferSelect;

export type Credential = {
  id: string;
  userId: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const credentialCryptoVersion = 1;

function encryptedValueFromColumns(
  ciphertext: string,
  nonce: string,
  version: number,
): EncryptedValue {
  if (version !== credentialCryptoVersion) {
    throw new Error("Unsupported encrypted credential version.");
  }

  return {
    ciphertext,
    nonce,
    version: credentialCryptoVersion,
  };
}

async function decryptCredential(row: CredentialRow): Promise<Credential> {
  const username = await decryptString(
    encryptedValueFromColumns(
      row.usernameEncrypted,
      row.usernameNonce,
      row.cryptoVersion,
    ),
  );
  const password = await decryptString(
    encryptedValueFromColumns(
      row.passwordEncrypted,
      row.passwordNonce,
      row.cryptoVersion,
    ),
  );
  const notes =
    row.notesEncrypted === null || row.notesNonce === null
      ? null
      : await decryptString(
          encryptedValueFromColumns(
            row.notesEncrypted,
            row.notesNonce,
            row.cryptoVersion,
          ),
        );

  return {
    id: row.id,
    userId: row.userId,
    platform: row.platform,
    username,
    password,
    notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCredentials(userId: string): Promise<Credential[]> {
  const rows = db
    .select()
    .from(credentials)
    .where(eq(credentials.userId, userId))
    .all();

  return Promise.all(rows.map((row) => decryptCredential(row)));
}

export async function createCredential(
  userId: string,
  input: CreateCredentialInput,
): Promise<Credential> {
  const now = new Date().toISOString();
  const encryptedUsername = await encryptString(input.username.trim());
  const encryptedPassword = await encryptString(input.password);
  const notes = input.notes?.trim() || null;
  const encryptedNotes = notes === null ? null : await encryptString(notes);

  const credential = db
    .insert(credentials)
    .values({
      id: crypto.randomUUID(),
      userId,
      platform: input.platform.trim(),
      usernameEncrypted: encryptedUsername.ciphertext,
      usernameNonce: encryptedUsername.nonce,
      passwordEncrypted: encryptedPassword.ciphertext,
      passwordNonce: encryptedPassword.nonce,
      notesEncrypted: encryptedNotes?.ciphertext ?? null,
      notesNonce: encryptedNotes?.nonce ?? null,
      cryptoVersion: credentialCryptoVersion,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return decryptCredential(credential);
}

export async function getCredentialById(
  userId: string,
  id: string,
): Promise<Credential | undefined> {
  const credential = db
    .select()
    .from(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .get();

  return credential === undefined ? undefined : decryptCredential(credential);
}

export async function updateCredential(
  userId: string,
  id: string,
  input: UpdateCredentialInput,
): Promise<Credential | undefined> {
  const values: Partial<typeof credentials.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.platform !== undefined) {
    values.platform = input.platform.trim();
  }

  if (input.username !== undefined) {
    const encryptedUsername = await encryptString(input.username.trim());

    values.usernameEncrypted = encryptedUsername.ciphertext;
    values.usernameNonce = encryptedUsername.nonce;
    values.cryptoVersion = credentialCryptoVersion;
  }

  if (input.password !== undefined) {
    const encryptedPassword = await encryptString(input.password);

    values.passwordEncrypted = encryptedPassword.ciphertext;
    values.passwordNonce = encryptedPassword.nonce;
    values.cryptoVersion = credentialCryptoVersion;
  }

  if (input.notes !== undefined) {
    const notes = input.notes?.trim() || null;

    if (notes === null) {
      values.notesEncrypted = null;
      values.notesNonce = null;
    } else {
      const encryptedNotes = await encryptString(notes);

      values.notesEncrypted = encryptedNotes.ciphertext;
      values.notesNonce = encryptedNotes.nonce;
      values.cryptoVersion = credentialCryptoVersion;
    }
  }

  const credential = db
    .update(credentials)
    .set(values)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .returning()
    .get();

  return credential === undefined ? undefined : decryptCredential(credential);
}

export function deleteCredential(userId: string, id: string): boolean {
  const deletedCredential = db
    .delete(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .returning()
    .get();

  return deletedCredential !== undefined;
}
