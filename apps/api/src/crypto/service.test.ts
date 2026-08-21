import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import sodium from "libsodium-wrappers";
import { createTestEncryptionKey } from "./test-helpers";
import { decryptString, encryptString } from "./service";

const encryptionKeyEnvName = "CREDENTIAL_ENCRYPTION_KEY";
let originalEncryptionKey: string | undefined;

function tamperLastCharacter(value: string): string {
  const replacement = value.endsWith("A") ? "B" : "A";

  return value.replace(/.$/, replacement);
}

beforeEach(async () => {
  originalEncryptionKey = Bun.env[encryptionKeyEnvName];
  Bun.env[encryptionKeyEnvName] = await createTestEncryptionKey();
});

afterEach(() => {
  if (originalEncryptionKey === undefined) {
    delete Bun.env[encryptionKeyEnvName];
  } else {
    Bun.env[encryptionKeyEnvName] = originalEncryptionKey;
  }
});

describe("crypto service", () => {
  test("encrypts and decrypts a string", async () => {
    const encrypted = await encryptString("fake-password-123");
    const decrypted = await decryptString(encrypted);

    expect(encrypted.ciphertext).not.toBe("fake-password-123");
    expect(encrypted.nonce).toBeString();
    expect(encrypted.version).toBe(1);
    expect(decrypted).toBe("fake-password-123");
  });

  test("uses a different nonce for each encryption", async () => {
    const first = await encryptString("fake-password-123");
    const second = await encryptString("fake-password-123");

    expect(first.nonce).not.toBe(second.nonce);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  test("rejects tampered ciphertext", async () => {
    const encrypted = await encryptString("fake-password-123");

    await expect(
      decryptString({
        ...encrypted,
        ciphertext: tamperLastCharacter(encrypted.ciphertext),
      }),
    ).rejects.toThrow();
  });

  test("requires an encryption key", async () => {
    delete Bun.env[encryptionKeyEnvName];

    await expect(encryptString("fake-password-123")).rejects.toThrow(
      `${encryptionKeyEnvName} is required.`,
    );
  });

  test("rejects an invalid encryption key length", async () => {
    Bun.env[encryptionKeyEnvName] = sodium.to_base64(
      sodium.randombytes_buf(16),
    );

    await expect(encryptString("fake-password-123")).rejects.toThrow(
      `${encryptionKeyEnvName} must decode to 32 bytes.`,
    );
  });

  test("rejects unsupported encrypted value version", async () => {
    const encrypted = await encryptString("fake-password-123");

    await expect(
      decryptString({
        ...encrypted,
        version: 2 as 1,
      }),
    ).rejects.toThrow("Unsupported encrypted value version.");
  });
});
