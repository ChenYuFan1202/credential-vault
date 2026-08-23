import { and, eq } from "drizzle-orm";
import {
  decryptString,
  encryptString,
  type EncryptedValue,
} from "../crypto/service";
import { db } from "../db/client";
import { credentialCustomFields, credentials } from "../db/schema";
import type {
  CredentialCustomFieldInput,
  CreateCredentialInput,
  UpdateCredentialInput,
} from "./validation";

type CredentialRow = typeof credentials.$inferSelect;
type CredentialCustomFieldRow = typeof credentialCustomFields.$inferSelect;

export type CredentialCustomField = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Credential = {
  id: string;
  userId: string;
  platform: string;
  username: string;
  password: string;
  notes: string | null;
  customFields: CredentialCustomField[];
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

  const customFields = await listCustomFields(row.id);

  return {
    id: row.id,
    userId: row.userId,
    platform: row.platform,
    username,
    password,
    notes,
    customFields,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function decryptCustomField(
  row: CredentialCustomFieldRow,
): Promise<CredentialCustomField> {
  const label = await decryptString(
    encryptedValueFromColumns(
      row.labelEncrypted,
      row.labelNonce,
      row.cryptoVersion,
    ),
  );
  const value = await decryptString(
    encryptedValueFromColumns(
      row.valueEncrypted,
      row.valueNonce,
      row.cryptoVersion,
    ),
  );

  return {
    id: row.id,
    label,
    value,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listCustomFields(
  credentialId: string,
): Promise<CredentialCustomField[]> {
  const rows = db
    .select()
    .from(credentialCustomFields)
    .where(eq(credentialCustomFields.credentialId, credentialId))
    .orderBy(credentialCustomFields.sortOrder)
    .all();

  return Promise.all(rows.map((row) => decryptCustomField(row)));
}

async function createCustomFields(
  credentialId: string,
  input: CredentialCustomFieldInput[] | undefined,
  timestamp: string,
): Promise<void> {
  if (input === undefined || input.length === 0) {
    return;
  }

  const rows = await Promise.all(
    input.map(async (field, index) => {
      const encryptedLabel = await encryptString(field.label.trim());
      const encryptedValue = await encryptString(field.value);

      return {
        id: crypto.randomUUID(),
        credentialId,
        labelEncrypted: encryptedLabel.ciphertext,
        labelNonce: encryptedLabel.nonce,
        valueEncrypted: encryptedValue.ciphertext,
        valueNonce: encryptedValue.nonce,
        cryptoVersion: credentialCryptoVersion,
        sortOrder: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
  );

  db.insert(credentialCustomFields).values(rows).run();
}

async function replaceCustomFields(
  credentialId: string,
  input: CredentialCustomFieldInput[],
  timestamp: string,
): Promise<void> {
  db.delete(credentialCustomFields)
    .where(eq(credentialCustomFields.credentialId, credentialId))
    .run();

  await createCustomFields(credentialId, input, timestamp);
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

  await createCustomFields(credential.id, input.customFields, now);

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
  const now = new Date().toISOString();
  const values: Partial<typeof credentials.$inferInsert> = {
    updatedAt: now,
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

  if (credential !== undefined && input.customFields !== undefined) {
    await replaceCustomFields(credential.id, input.customFields, now);
  }

  return credential === undefined ? undefined : decryptCredential(credential);
}

export function deleteCredential(userId: string, id: string): boolean {
  const credential = db
    .select()
    .from(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .get();

  if (credential === undefined) {
    return false;
  }

  db.delete(credentialCustomFields)
    .where(eq(credentialCustomFields.credentialId, id))
    .run();

  const deletedCredential = db
    .delete(credentials)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
    .returning()
    .get();

  return deletedCredential !== undefined;
}
