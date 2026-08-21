import sodium from "libsodium-wrappers";

export async function createTestEncryptionKey(): Promise<string> {
  await sodium.ready;

  return sodium.to_base64(
    sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES),
  );
}

export async function setTestEncryptionKey(): Promise<void> {
  Bun.env.CREDENTIAL_ENCRYPTION_KEY = await createTestEncryptionKey();
}
