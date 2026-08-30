import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import {
  credentialCustomFields,
  credentials,
  sessions,
  users,
} from "../db/schema";
import { createSessionCookie } from "../auth/cookies";
import { hashPassword } from "../auth/password";
import { createSession } from "../auth/session";
import { setTestEncryptionKey } from "../crypto/test-helpers";
import { createUser } from "../users/service";
import { createCredential } from "./service";
import { handleCredentialRequest } from "./routes";

type CredentialResponseBody = {
  data: {
    id: string;
    platform: string;
    username: string;
    password: string;
    notes: string | null;
    customFields: {
      id: string;
      label: string;
      value: string;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
  };
};

type CredentialListResponseBody = {
  data: CredentialResponseBody["data"][];
};

type ErrorResponseBody = {
  error: string;
};

const headers = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
};

let testUserId = "";
let otherUserId = "";
let sessionCookie = "";

beforeEach(async () => {
  await setTestEncryptionKey();

  await db.delete(credentialCustomFields);
  await db.delete(credentials);
  await db.delete(sessions);
  await db.delete(users);
  const testUser = await createUser({
    username: "demo-user",
    passwordHash: await hashPassword("fake-password-123"),
  });
  const otherUser = await createUser({
    username: "other-user",
    passwordHash: await hashPassword("other-fake-password-123"),
  });
  const session = await createSession(testUser.id);

  testUserId = testUser.id;
  otherUserId = otherUser.id;
  sessionCookie = createSessionCookie(session.sessionToken, session.expiresAt);
});

function createJsonRequest(
  pathname: string,
  method: string,
  body: unknown,
  cookie = sessionCookie,
) {
  return new Request(`http://localhost:3000${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
}

function createCredentialRequest(pathname: string, cookie = sessionCookie) {
  return new Request(`http://localhost:3000${pathname}`, {
    headers: {
      Cookie: cookie,
    },
  });
}

async function parseJsonResponse<TBody>(response: Response | null) {
  if (response === null) {
    throw new Error("Expected route response.");
  }

  return {
    response,
    body: (await response.json()) as TBody,
  };
}

describe("credential routes", () => {
  test("returns null for non-credential routes", async () => {
    const request = new Request("http://localhost:3000/health");
    const url = new URL(request.url);

    const response = await handleCredentialRequest(request, url, headers);

    expect(response).toBeNull();
  });

  test("handles GET /credentials", async () => {
    await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = createCredentialRequest("/credentials");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialListResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);

    const [credential] = body.data;

    if (credential === undefined) {
      throw new Error("Expected credential in response.");
    }

    expect(credential.platform).toBe("GitHub");
  });

  test("handles GET /credentials/export.txt", async () => {
    await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
      notes: "Fake notes.",
      customFields: [
        {
          label: "PIN",
          value: "123456",
        },
      ],
    });
    await createCredential(otherUserId, {
      platform: "Other Platform",
      username: "other-user",
      password: "other-fake-password-123",
      customFields: [
        {
          label: "Other PIN",
          value: "654321",
        },
      ],
    });
    const request = createCredentialRequest("/credentials/export.txt");
    const url = new URL(request.url);

    const response = await handleCredentialRequest(request, url, headers);

    if (response === null) {
      throw new Error("Expected route response.");
    }

    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(text).toContain("Credential Vault Export");
    expect(text).toContain("Platform: GitHub");
    expect(text).toContain("Username: demo-user");
    expect(text).toContain("Password: fake-password-123");
    expect(text).toContain("Notes: Fake notes.");
    expect(text).toContain("Custom Fields:");
    expect(text).toContain("- PIN: 123456");
    expect(text).not.toContain("Other Platform");
    expect(text).not.toContain("Other PIN");
  });

  test("handles POST /credentials", async () => {
    const request = createJsonRequest("/credentials", "POST", {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(201);
    expect(body.data.id).toBeString();
    expect(body.data.platform).toBe("GitHub");
  });

  test("handles POST /credentials with custom fields", async () => {
    const request = createJsonRequest("/credentials", "POST", {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
      customFields: [
        {
          label: "PIN",
          value: "123456",
        },
      ],
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(201);
    expect(body.data.customFields).toHaveLength(1);
    expect(body.data.customFields[0]?.label).toBe("PIN");
    expect(body.data.customFields[0]?.value).toBe("123456");
  });

  test("handles POST /credentials with a short stored password", async () => {
    const request = createJsonRequest("/credentials", "POST", {
      platform: "Bank",
      username: "demo-user",
      password: "1",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(201);
    expect(body.data.password).toBe("1");
  });

  test("rejects invalid POST /credentials input", async () => {
    const request = createJsonRequest("/credentials", "POST", {
      platform: "",
      username: "demo-user",
      password: "short",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid credential input");
  });

  test("handles GET /credentials/:id", async () => {
    const credential = await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = createCredentialRequest(`/credentials/${credential.id}`);
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(credential.id);
  });

  test("handles PATCH /credentials/:id", async () => {
    const credential = await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = createJsonRequest(`/credentials/${credential.id}`, "PATCH", {
      platform: "GitHub Updated",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.platform).toBe("GitHub Updated");
  });

  test("handles PATCH /credentials/:id with custom fields", async () => {
    const credential = await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
      customFields: [
        {
          label: "PIN",
          value: "123456",
        },
      ],
    });

    const request = createJsonRequest(`/credentials/${credential.id}`, "PATCH", {
      customFields: [
        {
          label: "Recovery Code",
          value: "fake-code-123",
        },
      ],
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.customFields).toHaveLength(1);
    expect(body.data.customFields[0]?.label).toBe("Recovery Code");
    expect(body.data.customFields[0]?.value).toBe("fake-code-123");
  });

  test("handles PATCH /credentials/:id with a short stored password", async () => {
    const credential = await createCredential(testUserId, {
      platform: "Bank",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = createJsonRequest(`/credentials/${credential.id}`, "PATCH", {
      password: "1",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.password).toBe("1");
  });

  test("handles DELETE /credentials/:id", async () => {
    const credential = await createCredential(testUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = new Request(
      `http://localhost:3000/credentials/${credential.id}`,
      {
        method: "DELETE",
        headers: {
          Cookie: sessionCookie,
        },
      },
    );
    const url = new URL(request.url);

    const response = await handleCredentialRequest(request, url, headers);

    expect(response?.status).toBe(204);
  });

  test("returns 404 for missing credential", async () => {
    const request = createCredentialRequest("/credentials/missing-id");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(404);
    expect(body.error).toBe("Credential not found.");
  });

  test("rejects GET /credentials without a session cookie", async () => {
    const request = new Request("http://localhost:3000/credentials");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication is required.");
  });

  test("rejects GET /credentials/export.txt without a session cookie", async () => {
    const request = new Request("http://localhost:3000/credentials/export.txt");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication is required.");
  });

  test("does not return another user's credentials", async () => {
    await createCredential(otherUserId, {
      platform: "GitHub",
      username: "other-demo-user",
      password: "fake-password-123",
    });

    const request = createCredentialRequest("/credentials");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialListResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });

  test("returns 404 for another user's credential id", async () => {
    const credential = await createCredential(otherUserId, {
      platform: "GitHub",
      username: "other-demo-user",
      password: "fake-password-123",
    });
    const request = createCredentialRequest(`/credentials/${credential.id}`);
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(404);
    expect(body.error).toBe("Credential not found.");
  });
});
