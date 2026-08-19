import {
  createExpiredSessionCookie,
  createSessionCookie,
  getSessionTokenFromCookieHeader,
} from "./cookies";
import {
  createSession,
  deleteSessionByToken,
  getUserBySessionToken,
} from "./session";
import { loginUser, registerUser } from "./service";
import { isLoginUserInput, isRegisterUserInput } from "./validation";

type ResponseHeaders = Record<string, string>;

function jsonResponse(
  body: unknown,
  init: {
    status?: number;
    headers: ResponseHeaders;
    setCookie?: string;
  },
): Response {
  const headers = new Headers(init.headers);

  if (init.setCookie !== undefined) {
    headers.set("Set-Cookie", init.setCookie);
  }

  return Response.json(body, {
    status: init.status,
    headers,
  });
}

function unauthorizedResponse(headers: ResponseHeaders): Response {
  return jsonResponse(
    {
      error: "Authentication is required.",
    },
    {
      status: 401,
      headers,
    },
  );
}

export async function handleAuthRequest(
  request: Request,
  url: URL,
  headers: ResponseHeaders,
): Promise<Response | null> {
  if (url.pathname === "/auth/register" && request.method === "POST") {
    const body = await request.json();

    if (!isRegisterUserInput(body)) {
      return jsonResponse(
        {
          error: "Invalid registration input.",
        },
        {
          status: 400,
          headers,
        },
      );
    }

    const result = await registerUser(body);

    if (!result.success) {
      return jsonResponse(
        {
          error: result.message,
        },
        {
          status: 409,
          headers,
        },
      );
    }

    return jsonResponse(
      {
        data: result.user,
      },
      {
        status: 201,
        headers,
      },
    );
  }

  if (url.pathname === "/auth/login" && request.method === "POST") {
    const body = await request.json();

    if (!isLoginUserInput(body)) {
      return jsonResponse(
        {
          error: "Invalid login input.",
        },
        {
          status: 400,
          headers,
        },
      );
    }

    const result = await loginUser(body);

    if (!result.success) {
      return jsonResponse(
        {
          error: result.message,
        },
        {
          status: 401,
          headers,
        },
      );
    }

    const session = createSession(result.user.id);

    return jsonResponse(
      {
        data: result.user,
      },
      {
        headers,
        setCookie: createSessionCookie(session.sessionToken, session.expiresAt),
      },
    );
  }

  if (url.pathname === "/auth/me" && request.method === "GET") {
    const sessionToken = getSessionTokenFromCookieHeader(
      request.headers.get("Cookie"),
    );

    if (sessionToken === null) {
      return unauthorizedResponse(headers);
    }

    const user = getUserBySessionToken(sessionToken);

    if (user === null) {
      return unauthorizedResponse(headers);
    }

    return jsonResponse(
      {
        data: user,
      },
      {
        headers,
      },
    );
  }

  if (url.pathname === "/auth/logout" && request.method === "POST") {
    const sessionToken = getSessionTokenFromCookieHeader(
      request.headers.get("Cookie"),
    );

    if (sessionToken !== null) {
      deleteSessionByToken(sessionToken);
    }

    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Set-Cookie": createExpiredSessionCookie(),
      },
    });
  }

  return null;
}
