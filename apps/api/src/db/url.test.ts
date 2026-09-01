import { afterEach, describe, expect, test } from "bun:test";
import { getDatabaseConnectionUrl, getDatabaseUrl } from "./url";

const originalDatabaseUrl = Bun.env.DATABASE_URL;
const originalNodeEnv = Bun.env.NODE_ENV;

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete Bun.env[name];
    return;
  }

  Bun.env[name] = value;
}

afterEach(() => {
  restoreEnv("DATABASE_URL", originalDatabaseUrl);
  restoreEnv("NODE_ENV", originalNodeEnv);
});

describe("database url", () => {
  test("requires DATABASE_URL", () => {
    delete Bun.env.DATABASE_URL;

    expect(() => getDatabaseUrl()).toThrow("DATABASE_URL is required.");
  });

  test("keeps local database URL unchanged outside production", () => {
    Bun.env.NODE_ENV = "development";
    Bun.env.DATABASE_URL =
      "postgres://credential_vault:password@localhost:5432/credential_vault_development";

    expect(getDatabaseConnectionUrl()).toBe(Bun.env.DATABASE_URL);
  });

  test("adds sslmode=require for production PostgreSQL URLs", () => {
    Bun.env.NODE_ENV = "production";
    Bun.env.DATABASE_URL =
      "postgres://credential_vault:password@example.com:5432/credential_vault";

    expect(getDatabaseConnectionUrl()).toBe(
      "postgres://credential_vault:password@example.com:5432/credential_vault?sslmode=require",
    );
  });

  test("keeps existing production URL query params when adding sslmode", () => {
    Bun.env.NODE_ENV = "production";
    Bun.env.DATABASE_URL =
      "postgres://credential_vault:password@example.com:5432/credential_vault?connect_timeout=10";

    expect(getDatabaseConnectionUrl()).toBe(
      "postgres://credential_vault:password@example.com:5432/credential_vault?connect_timeout=10&sslmode=require",
    );
  });

  test("does not overwrite an existing sslmode value", () => {
    Bun.env.NODE_ENV = "production";
    Bun.env.DATABASE_URL =
      "postgres://credential_vault:password@example.com:5432/credential_vault?sslmode=no-verify";

    expect(getDatabaseConnectionUrl()).toBe(Bun.env.DATABASE_URL);
  });
});
