// Serves every case server-rendered, then hydrated by the client bundle.
// Dev: Vite in middleware mode on the same port (HMR included), pages rendered
// through ssrLoadModule. Prod (--prod): the built client assets and the built
// server entries. Runs on Node directly, so only type annotations, no
// TypeScript-only syntax.
import { createServer as createHttpServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ViteDevServer } from "vite";

type Render = () => { html: string; head: string };

const isProd = process.argv.includes("--prod");
const port = Number(process.env.PORT ?? 5373);
const casePage = /^\/([\w-]+)\.html$/;
const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

const httpServer = createHttpServer((req, res) => {
  handle(req, res).catch((error: Error) => {
    vite?.ssrFixStacktrace(error);
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain" }).end(String(error?.stack ?? error));
  });
});

let vite: ViteDevServer | undefined;
if (!isProd) {
  const { createServer } = await import("vite");
  vite = await createServer({
    appType: "custom",
    server: { middlewareMode: { server: httpServer } },
  });
}

const page = (template: string, head: string, html: string) =>
  template.replace("<!--app-head-->", head).replace("<!--app-html-->", html);

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (vite) {
    const dev = vite;
    await new Promise<void>((resolve) => dev.middlewares(req, res, resolve));
    if (res.writableEnded) return;
    const match = casePage.exec(url.pathname);
    if (!match) return notFound(res);
    const caseName = match[1];
    const template = await dev.transformIndexHtml(
      url.pathname,
      await readFile(`${caseName}.html`, "utf8"),
    );
    const { render } = (await dev.ssrLoadModule(`/entries/${caseName}.server.tsx`)) as {
      render: Render;
    };
    const { html, head } = render();
    return send(res, "text/html", page(template, head, html));
  }
  const match = casePage.exec(url.pathname);
  if (match) {
    const caseName = match[1];
    const template = await readFile(join("dist/client", `${caseName}.html`), "utf8");
    const { render } = (await import(
      pathToFileURL(join("dist/server", `${caseName}.js`)).href
    )) as {
      render: Render;
    };
    const { html, head } = render();
    return send(res, "text/html", page(template, head, html));
  }
  try {
    const file = await readFile(join("dist/client", url.pathname));
    return send(res, mimeTypes[extname(url.pathname)] ?? "application/octet-stream", file);
  } catch {
    return notFound(res);
  }
}

const send = (res: ServerResponse, type: string, body: string | Buffer) =>
  res.writeHead(200, { "content-type": type }).end(body);
const notFound = (res: ServerResponse) =>
  res.writeHead(404, { "content-type": "text/plain" }).end("not found");

httpServer.listen(port, () => console.log(`e2e solid ssr server on http://localhost:${port}`));
