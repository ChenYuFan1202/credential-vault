const sessionCookieName = "credential_vault_session";

function getCookieSecurityAttributes(): string {
  if (Bun.env.NODE_ENV === "production") {
    return "; Secure; SameSite=None";
  }

  return "; SameSite=Lax";
}

export function createSessionCookie(
  sessionToken: string,
  expiresAt: string,
): string {
  return `${sessionCookieName}=${sessionToken}; HttpOnly${getCookieSecurityAttributes()}; Path=/; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function createExpiredSessionCookie(): string {
  return `${sessionCookieName}=; HttpOnly${getCookieSecurityAttributes()}; Path=/; Max-Age=0`;
}

export function getSessionTokenFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (cookieHeader === null) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");

    if (name === sessionCookieName) {
      return valueParts.join("=") || null;
    }
  }

  return null;
}
