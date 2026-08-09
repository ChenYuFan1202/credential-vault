const port = Number(Bun.env.PORT ?? 3000);

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
  port,
  fetch(request) {
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
