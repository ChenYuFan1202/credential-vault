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

export async function handleCredentialRequest(
  request: Request,
  url: URL,
  headers: ResponseHeaders,
): Promise<Response | null> {
  if (url.pathname === "/credentials" && request.method === "GET") {
    const rows = listCredentials();

    return Response.json(
      {
        data: rows,
      },
      {
        headers,
      },
    );
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

    const credential = createCredential(body);

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

    const credential = getCredentialById(id);

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

    const credential = updateCredential(id, body);

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

    const deleted = deleteCredential(id);

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
