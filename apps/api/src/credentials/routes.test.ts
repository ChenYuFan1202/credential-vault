import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "../db/client";
import { credentials, users } from "../db/schema";
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

const demoUserId = "demo-user-id";

beforeEach(() => {
  db.delete(credentials).run();
  db.delete(users).run();
  createUser({
    id: demoUserId,
    username: "demo-user",
    passwordHash: "fake-argon2id-hash-for-route-test",
  });
});

function createJsonRequest(pathname: string, method: string, body: unknown) {
  return new Request(`http://localhost:3000${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
    createCredential(demoUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = new Request("http://localhost:3000/credentials");
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
    const credential = createCredential(demoUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = new Request(
      `http://localhost:3000/credentials/${credential.id}`,
    );
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<CredentialResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(credential.id);
  });

  test("handles PATCH /credentials/:id", async () => {
    const credential = createCredential(demoUserId, {
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

  test("handles DELETE /credentials/:id", async () => {
    const credential = createCredential(demoUserId, {
      platform: "GitHub",
      username: "demo-user",
      password: "fake-password-123",
    });

    const request = new Request(
      `http://localhost:3000/credentials/${credential.id}`,
      {
        method: "DELETE",
      },
    );
    const url = new URL(request.url);

    const response = await handleCredentialRequest(request, url, headers);

    expect(response?.status).toBe(204);
  });

  test("returns 404 for missing credential", async () => {
    const request = new Request("http://localhost:3000/credentials/missing-id");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleCredentialRequest(request, url, headers),
    );

    expect(response.status).toBe(404);
    expect(body.error).toBe("Credential not found.");
  });
});
