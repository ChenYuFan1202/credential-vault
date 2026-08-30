import { getSessionTokenFromCookieHeader } from "../auth/cookies";
import { getUserBySessionToken } from "../auth/session";
import {
  createCredential,
  deleteCredential,
  getCredentialById,
  listCredentials,
  updateCredential,
} from "./service";
import {
  isCreateCredentialInput,
  isUpdateCredentialInput,
} from "./validation";

type ResponseHeaders = Record<string, string>;

type CurrentUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

function getCredentialIdFromPath(pathname: string): string | null {
  const prefix = "/credentials/";

  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const id = pathname.slice(prefix.length);

  return id === "" ? null : id;
}

function credentialIdRequiredResponse(headers: ResponseHeaders): Response {
  return Response.json(
    {
      error: "Credential id is required.",
    },
    {
      status: 400,
      headers,
    },
  );
}

function credentialNotFoundResponse(headers: ResponseHeaders): Response {
  return Response.json(
    {
      error: "Credential not found.",
    },
    {
      status: 404,
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

function unauthorizedResponse(headers: ResponseHeaders): Response {
  return Response.json(
    {
      error: "Authentication is required.",
    },
    {
      status: 401,
      headers,
    },
  );
}

export async function handleCredentialRequest(
  request: Request,
  url: URL,
  headers: ResponseHeaders,
): Promise<Response | null> {
  if (!url.pathname.startsWith("/credentials")) {
    return null;
  }

  const currentUser = await getCurrentUser(request);

  if (currentUser === null) {
    return unauthorizedResponse(headers);
  }

  if (url.pathname === "/credentials" && request.method === "GET") {
    const rows = await listCredentials(currentUser.id);

    return Response.json(
      {
        data: rows,
      },
      {
        headers,
      },
    );
  }

  if (url.pathname === "/credentials/export.txt" && request.method === "GET") {
    const rows = await listCredentials(currentUser.id);
    const sections = rows.map((credential) => {
      const lines = [
        `Platform: ${credential.platform}`,
        `Username: ${credential.username}`,
        `Password: ${credential.password}`,
        `Notes: ${credential.notes ?? ""}`,
      ];

      if (credential.customFields.length > 0) {
        lines.push("Custom Fields:");
        lines.push(
          ...credential.customFields.map(
            (field) => `- ${field.label}: ${field.value}`,
          ),
        );
      }

      return lines.join("\n");
    });
    const text = [
      "Credential Vault Export",
      "",
      sections.join("\n\n---\n\n"),
      "",
    ].join("\n");

    return new Response(text, {
      headers: {
        ...headers,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  if (url.pathname === "/credentials" && request.method === "POST") {
    const body = await request.json();

    if (!isCreateCredentialInput(body)) {
      return Response.json(
        {
          error: "Invalid credential input",
        },
        {
          status: 400,
          headers,
        },
      );
    }

    const credential = await createCredential(currentUser.id, body);

    return Response.json(
      {
        data: credential,
      },
      {
        status: 201,
        headers,
      },
    );
  }

  if (url.pathname.startsWith("/credentials/") && request.method === "GET") {
    const id = getCredentialIdFromPath(url.pathname);

    if (id === null) {
      return credentialIdRequiredResponse(headers);
    }

    const credential = await getCredentialById(currentUser.id, id);

    if (credential === undefined) {
      return credentialNotFoundResponse(headers);
    }

    return Response.json(
      {
        data: credential,
      },
      {
        headers,
      },
    );
  }

  if (url.pathname.startsWith("/credentials/") && request.method === "PATCH") {
    const id = getCredentialIdFromPath(url.pathname);

    if (id === null) {
      return credentialIdRequiredResponse(headers);
    }

    const body = await request.json();

    if (!isUpdateCredentialInput(body)) {
      return Response.json(
        {
          error: "Invalid credential update input.",
        },
        {
          status: 400,
          headers,
        },
      );
    }

    const credential = await updateCredential(currentUser.id, id, body);

    if (credential === undefined) {
      return credentialNotFoundResponse(headers);
    }

    return Response.json(
      {
        data: credential,
      },
      {
        headers,
      },
    );
  }

  if (url.pathname.startsWith("/credentials/") && request.method === "DELETE") {
    const id = getCredentialIdFromPath(url.pathname);

    if (id === null) {
      return credentialIdRequiredResponse(headers);
    }

    const deleted = await deleteCredential(currentUser.id, id);

    if (!deleted) {
      return credentialNotFoundResponse(headers);
    }

    return new Response(null, {
      status: 204,
      headers,
    });
  }

  return null;
}
