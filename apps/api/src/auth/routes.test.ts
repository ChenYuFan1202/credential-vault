import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { createUser } from "../users/service";
import { hashPassword } from "./password";
import { hashSessionToken } from "./session";
import { handleAuthRequest } from "./routes";

type UserResponseBody = {
  data: {
    id: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
};

type ErrorResponseBody = {
  error: string;
};

const headers = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
};

beforeEach(() => {
  db.delete(sessions).run();
  db.delete(users).run();
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

function createJsonRequestWithCookie(
  pathname: string,
  method: string,
  body: unknown,
  cookie: string,
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

async function parseJsonResponse<TBody>(response: Response | null) {
  if (response === null) {
    throw new Error("Expected route response.");
  }

  return {
    response,
    body: (await response.json()) as TBody,
  };
}

function getSessionCookie(response: Response): string {
  const cookie = response.headers.get("Set-Cookie");

  if (cookie === null) {
    throw new Error("Expected session cookie.");
  }

  return cookie;
}

describe("auth routes", () => {
  test("returns null for non-auth routes", async () => {
    const request = new Request("http://localhost:3000/health");
    const url = new URL(request.url);

    const response = await handleAuthRequest(request, url, headers);

    expect(response).toBeNull();
  });

  test("handles POST /auth/register", async () => {
    const request = createJsonRequest("/auth/register", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<UserResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(201);
    expect(body.data.username).toBe("demo-user");
    expect("passwordHash" in body.data).toBe(false);
  });

  test("rejects invalid POST /auth/register input", async () => {
    const request = createJsonRequest("/auth/register", "POST", {
      username: "ab",
      password: "short",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid registration input.");
  });

  test("rejects duplicate POST /auth/register username", async () => {
    await createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });

    const request = createJsonRequest("/auth/register", "POST", {
      username: "demo-user",
      password: "fake-password-456",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(409);
    expect(body.error).toBe("Username is already taken.");
  });

  test("handles POST /auth/login and sets a session cookie", async () => {
    const user = createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const request = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<UserResponseBody>(
      await handleAuthRequest(request, url, headers),
    );
    const cookie = getSessionCookie(response);
    const sessionToken = cookie.split(";")[0]?.split("=")[1];

    if (sessionToken === undefined) {
      throw new Error("Expected raw session token in cookie.");
    }

    const storedSession = db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, hashSessionToken(sessionToken)))
      .get();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(user.id);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(storedSession?.userId).toBe(user.id);
  });

  test("rejects POST /auth/login with invalid credentials", async () => {
    createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const request = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "wrong-password",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid username or password.");
  });

  test("handles GET /auth/me with a valid session cookie", async () => {
    const user = createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const loginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const loginUrl = new URL(loginRequest.url);
    const loginResponse = await handleAuthRequest(loginRequest, loginUrl, headers);
    const cookie = getSessionCookie(loginResponse as Response);
    const request = new Request("http://localhost:3000/auth/me", {
      headers: {
        Cookie: cookie,
      },
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<UserResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(user.id);
  });

  test("handles PATCH /auth/password and expires the current session", async () => {
    createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const loginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const loginUrl = new URL(loginRequest.url);
    const loginResponse = await handleAuthRequest(loginRequest, loginUrl, headers);
    const cookie = getSessionCookie(loginResponse as Response);
    const sessionToken = cookie.split(";")[0]?.split("=")[1];

    if (sessionToken === undefined) {
      throw new Error("Expected raw session token in cookie.");
    }

    const request = createJsonRequestWithCookie(
      "/auth/password",
      "PATCH",
      {
        currentPassword: "fake-password-123",
        newPassword: "new-fake-password-123",
      },
      cookie,
    );
    const url = new URL(request.url);

    const response = await handleAuthRequest(request, url, headers);
    const storedSession = db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, hashSessionToken(sessionToken)))
      .get();
    const meRequest = new Request("http://localhost:3000/auth/me", {
      headers: {
        Cookie: cookie,
      },
    });
    const meUrl = new URL(meRequest.url);
    const { response: meResponse } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(meRequest, meUrl, headers),
    );
    const oldPasswordLoginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const oldPasswordLoginUrl = new URL(oldPasswordLoginRequest.url);
    const { response: oldPasswordLoginResponse } =
      await parseJsonResponse<ErrorResponseBody>(
        await handleAuthRequest(
          oldPasswordLoginRequest,
          oldPasswordLoginUrl,
          headers,
        ),
      );
    const newPasswordLoginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "new-fake-password-123",
    });
    const newPasswordLoginUrl = new URL(newPasswordLoginRequest.url);
    const { response: newPasswordLoginResponse } =
      await parseJsonResponse<UserResponseBody>(
        await handleAuthRequest(
          newPasswordLoginRequest,
          newPasswordLoginUrl,
          headers,
        ),
      );

    if (response === null) {
      throw new Error("Expected route response.");
    }

    expect(response.status).toBe(204);
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(storedSession).toBeUndefined();
    expect(meResponse.status).toBe(401);
    expect(oldPasswordLoginResponse.status).toBe(401);
    expect(newPasswordLoginResponse.status).toBe(200);
  });

  test("rejects PATCH /auth/password without a session cookie", async () => {
    const request = createJsonRequest("/auth/password", "PATCH", {
      currentPassword: "fake-password-123",
      newPassword: "new-fake-password-123",
    });
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication is required.");
  });

  test("rejects PATCH /auth/password with an incorrect current password", async () => {
    createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const loginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const loginUrl = new URL(loginRequest.url);
    const loginResponse = await handleAuthRequest(loginRequest, loginUrl, headers);
    const cookie = getSessionCookie(loginResponse as Response);
    const request = createJsonRequestWithCookie(
      "/auth/password",
      "PATCH",
      {
        currentPassword: "wrong-password",
        newPassword: "new-fake-password-123",
      },
      cookie,
    );
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(400);
    expect(body.error).toBe("Current password is incorrect.");
  });

  test("rejects GET /auth/me without a session cookie", async () => {
    const request = new Request("http://localhost:3000/auth/me");
    const url = new URL(request.url);

    const { response, body } = await parseJsonResponse<ErrorResponseBody>(
      await handleAuthRequest(request, url, headers),
    );

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication is required.");
  });

  test("handles POST /auth/logout and expires the session cookie", async () => {
    createUser({
      username: "demo-user",
      passwordHash: await hashPassword("fake-password-123"),
    });
    const loginRequest = createJsonRequest("/auth/login", "POST", {
      username: "demo-user",
      password: "fake-password-123",
    });
    const loginUrl = new URL(loginRequest.url);
    const loginResponse = await handleAuthRequest(loginRequest, loginUrl, headers);
    const cookie = getSessionCookie(loginResponse as Response);
    const sessionToken = cookie.split(";")[0]?.split("=")[1];

    if (sessionToken === undefined) {
      throw new Error("Expected raw session token in cookie.");
    }

    const request = new Request("http://localhost:3000/auth/logout", {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    });
    const url = new URL(request.url);

    const response = await handleAuthRequest(request, url, headers);
    const storedSession = db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, hashSessionToken(sessionToken)))
      .get();

    if (response === null) {
      throw new Error("Expected route response.");
    }

    expect(response.status).toBe(204);
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(storedSession).toBeUndefined();
  });
});
