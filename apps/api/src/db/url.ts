export function getDatabaseUrl(): string {
  const databaseUrl = Bun.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim() === "") {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

export function getDatabaseConnectionUrl(): string {
  const databaseUrl = getDatabaseUrl();

  if (Bun.env.NODE_ENV !== "production") {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return databaseUrl;
  }

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  return url.toString();
}
