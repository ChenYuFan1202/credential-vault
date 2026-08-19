import { handleAuthRequest } from "./src/auth/routes";
import { handleCredentialRequest } from "./src/credentials/routes";

const port = Number(Bun.env.PORT ?? 3000);

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json(
        {
          status: "ok",
          service: "credential-vault-api",
        },
        {
          headers: corsHeaders,
        },
      );
    }

    const authResponse = await handleAuthRequest(request, url, corsHeaders);

    if (authResponse !== null) {
      return authResponse;
    }

    const credentialResponse = await handleCredentialRequest(
      request,
      url,
      corsHeaders,
    );

    if (credentialResponse !== null) {
      return credentialResponse;
    }

    return Response.json(
      {
        error: "Not found",
      },
      {
        status: 404,
        headers: corsHeaders,
      },
    );
  },
});

console.log(`API server is running on http://localhost:${server.port}`);
