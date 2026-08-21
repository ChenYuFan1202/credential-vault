import sodium from "libsodium-wrappers";

const encryptionKeyEnvName = "CREDENTIAL_ENCRYPTION_KEY";
const encryptedValueVersion = 1;

export type EncryptedValue = {
  ciphertext: string;
  nonce: string;
  version: typeof encryptedValueVersion;
};

function getEncryptionKey(): Uint8Array {
  const encodedKey = Bun.env[encryptionKeyEnvName];

  if (encodedKey === undefined || encodedKey === "") {
    throw new Error(`${encryptionKeyEnvName} is required.`);
  }

  const key = sodium.from_base64(encodedKey);

  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error(`${encryptionKeyEnvName} must decode to 32 bytes.`);
  }

  return key;
}

export async function encryptString(plaintext: string): Promise<EncryptedValue> {
  await sodium.ready;

  const key = getEncryptionKey();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const plaintextBytes = sodium.from_string(plaintext);
  const ciphertext = sodium.crypto_secretbox_easy(plaintextBytes, nonce, key);

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
    version: encryptedValueVersion,
  };
}

export async function decryptString(value: EncryptedValue): Promise<string> {
  await sodium.ready;

  if (value.version !== encryptedValueVersion) {
    throw new Error("Unsupported encrypted value version.");
  }

  const key = getEncryptionKey();
  const nonce = sodium.from_base64(value.nonce);
  const ciphertext = sodium.from_base64(value.ciphertext);
  const plaintextBytes = sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    key,
  );

  return sodium.to_string(plaintextBytes);
}
