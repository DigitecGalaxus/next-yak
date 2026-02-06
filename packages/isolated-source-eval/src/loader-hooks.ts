/**
 * ESM loader hook source, embedded as a string constant.
 *
 * This MUST be plain JavaScript — not TypeScript. The loader thread receives
 * this code via a `data:` URL passed to `module.register()`. Node's loader
 * thread does not run data: URLs through strip-types, so any TypeScript
 * syntax here would cause a SyntaxError at registration time.
 *
 * The hook uses a MessagePort (received in `initialize`) to communicate
 * collected dependencies back to the worker thread on demand. Dependencies
 * are accumulated in a Set during `resolve()` calls, then flushed as a
 * batch when the worker requests them after an evaluation completes. This
 * batching avoids per-import message overhead and keeps dependency tracking
 * tightly coupled to a single evaluation.
 *
 * Only `file://` URLs outside of `node_modules` are tracked. Node built-ins
 * (`node:*`) and third-party packages are excluded because consumers only
 * need to invalidate on project source file changes.
 *
 * `fileURLToPath` converts `file://` URLs into platform-correct absolute
 * paths (avoids the leading-slash issue `URL.pathname` has on Windows).
 */
const LOADER_HOOK_SOURCE = `
import { fileURLToPath } from "node:url";

let port;
const deps = new Set();

export function initialize(data) {
  port = data.port;
  port.on("message", (msg) => {
    if (msg === "getDeps") {
      port.postMessage([...deps]);
      deps.clear();
    }
  });
}

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier);
  if (result.url.startsWith("file://") && !result.url.includes("/node_modules/")) {
    deps.add(fileURLToPath(result.url));
  }
  return result;
}
`;

/**
 * Pre-computed data URL for the loader hook source.
 *
 * The same URL is reused across workers — each `module.register()` call
 * creates an independent loader instance with its own dependency Set
 * regardless of URL identity.
 */
const LOADER_DATA_URL = `data:text/javascript;base64,${Buffer.from(LOADER_HOOK_SOURCE).toString("base64")}`;

/** Returns the loader hook as a base64 `data:` URL. */
export function createLoaderDataUrl(): string {
  return LOADER_DATA_URL;
}
