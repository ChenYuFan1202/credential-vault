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
import { changePassword, loginUser, registerUser } from "./service";
import {
  isChangePasswordInput,
  isLoginUserInput,
  isRegisterUserInput,
} from "./validation";

type ResponseHeaders = Record<string, string>;

type CurrentUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

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

async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  const sessionToken = getSessionTokenFromCookieHeader(
    request.headers.get("Cookie"),
  );

  if (sessionToken === null) {
    return null;
  }

  return getUserBySessionToken(sessionToken);
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

    const session = await createSession(result.user.id);

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
    const user = await getCurrentUser(request);

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

  if (url.pathname === "/auth/password" && request.method === "PATCH") {
    const sessionToken = getSessionTokenFromCookieHeader(
      request.headers.get("Cookie"),
    );

    if (sessionToken === null) {
      return unauthorizedResponse(headers);
    }

    const user = await getUserBySessionToken(sessionToken);

    if (user === null) {
      return unauthorizedResponse(headers);
    }

    const body = await request.json();

    if (!isChangePasswordInput(body)) {
      return jsonResponse(
        {
          error: "Invalid password change input.",
        },
        {
          status: 400,
          headers,
        },
      );
    }

    const result = await changePassword(user.id, body);

    if (!result.success) {
      return jsonResponse(
        {
          error: result.message,
        },
        {
          status: 400,
          headers,
        },
      );
    }

    await deleteSessionByToken(sessionToken);

    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Set-Cookie": createExpiredSessionCookie(),
      },
    });
  }

  if (url.pathname === "/auth/logout" && request.method === "POST") {
    const sessionToken = getSessionTokenFromCookieHeader(
      request.headers.get("Cookie"),
    );

    if (sessionToken !== null) {
      await deleteSessionByToken(sessionToken);
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
