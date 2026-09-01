import { afterEach, describe, expect, test } from "bun:test";
import { createExpiredSessionCookie, createSessionCookie } from "./cookies";

afterEach(() => {
  Bun.env.NODE_ENV = "test";
});

describe("session cookies", () => {
  test("uses SameSite=Lax without Secure outside production", () => {
    Bun.env.NODE_ENV = "test";

    const cookie = createSessionCookie(
      "session-token",
      new Date("2026-01-01T00:00:00.000Z").toISOString(),
    );

    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
  });

  test("uses SameSite=None and Secure in production", () => {
    Bun.env.NODE_ENV = "production";

    const cookie = createSessionCookie(
      "session-token",
      new Date("2026-01-01T00:00:00.000Z").toISOString(),
    );

    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=None");
    expect(cookie).toContain("Secure");
  });

  test("expires production cookies with SameSite=None and Secure", () => {
    Bun.env.NODE_ENV = "production";

    const cookie = createExpiredSessionCookie();

    expect(cookie).toContain("SameSite=None");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("Max-Age=0");
  });
});
