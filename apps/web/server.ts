import { extname, join, normalize } from "node:path";

const port = Number(Bun.env.PORT ?? 5173);
const distDir = join(import.meta.dir, "dist");

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function getFilePath(pathname: string): string | null {
  let decodedPathname: string;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath =
    pathname === "/" ? "index.html" : decodedPathname.replace(/^\/+/, "");
  const filePath = join(distDir, normalize(relativePath));

  if (!filePath.startsWith(distDir)) {
    return null;
  }

  return filePath;
}

async function responseForFile(filePath: string): Promise<Response> {
  const contentType =
    contentTypes[extname(filePath)] ?? "application/octet-stream";
  const file = Bun.file(filePath);

  return new Response(await file.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
    },
  });
}

Bun.serve({
  hostname: "0.0.0.0",
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const filePath = getFilePath(url.pathname);

    if (filePath === null) {
      return new Response("Bad request", {
        status: 400,
      });
    }

    const file = Bun.file(filePath);

    if (await file.exists()) {
      return await responseForFile(filePath);
    }

    return await responseForFile(join(distDir, "index.html"));
  },
});

console.log(`Web server is running on http://localhost:${port}`);
