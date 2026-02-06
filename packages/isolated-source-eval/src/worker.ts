/**
 * Worker thread entry point for isolated module evaluation.
 *
 * Each worker is a full Node.js environment with its own ESM module cache.
 * Modules are loaded via dynamic `import()` — Node 24+ strips TypeScript
 * types natively, so no compilation step or flags are needed.
 *
 * The loader hook data URL is received via `workerData` rather than
 * importing it from a sibling module. This avoids a cross-file import
 * resolution problem: Node 24's strip-types requires `.ts` extensions in
 * source, but compiled output uses `.js`. Passing the URL through
 * `workerData` sidesteps this entirely since the worker file has no
 * local imports beyond node built-ins.
 */
import { parentPort, workerData } from "node:worker_threads";
import { MessageChannel } from "node:worker_threads";
import { pathToFileURL } from "node:url";

/**
 * We import `register` from `node:module` instead of calling `module.register()`
 * directly. Node's strip-types parser sees the bare `module` identifier as a
 * CJS global, and combined with top-level `await` (or other ESM syntax), it
 * throws "Cannot determine intended module format". Using the explicit import
 * avoids this ambiguity entirely.
 */
import { register } from "node:module";

if (!parentPort) {
  throw new Error("This file must be run as a worker thread");
}

const loaderDataUrl: string = workerData.loaderDataUrl;

/**
 * MessageChannel for communicating with the loader hook.
 * port1 stays in this worker thread; port2 is transferred to the loader
 * thread via `register()`'s transferList. This is the only way to get
 * data out of loader hooks, since they run in an isolated loader thread
 * that cannot access worker_threads.parentPort.
 */
const { port1, port2 } = new MessageChannel();

register(loaderDataUrl, {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
});

/**
 * Requests the accumulated dependency list from the loader hook.
 *
 * Called after each `import()` completes. The loader hook clears its
 * internal Set on each request, so dependencies are scoped to the
 * most recent evaluation. This is safe because evaluations are
 * serialized — only one runs at a time per worker.
 */
function requestDeps(): Promise<string[]> {
  return new Promise((resolve) => {
    port1.once("message", (deps: string[]) => {
      resolve(deps);
    });
    port1.postMessage("getDeps");
  });
}

parentPort.on(
  "message",
  async (msg: { type: string; id: number; absolutePath: string }) => {
    if (msg.type !== "evaluate") return;

    try {
      const fileUrl = pathToFileURL(msg.absolutePath).href;
      const ns = await import(fileUrl);

      const deps = await requestDeps();

      // The entry point may not appear in the loader hook's dependency set
      // if it was already in the ESM cache from a previous evaluation.
      // The resolve hook only fires on cache misses.
      if (!deps.includes(msg.absolutePath)) {
        deps.unshift(msg.absolutePath);
      }

      // Module namespace objects are exotic objects that fail structured clone
      // (postMessage would throw). Copying to a plain object is required.
      const value: Record<string, unknown> = {};
      for (const key of Object.keys(ns)) {
        value[key] = ns[key];
      }

      parentPort!.postMessage({
        type: "result",
        id: msg.id,
        ok: true,
        value,
        dependencies: deps,
      });
    } catch (err: unknown) {
      // Catches both evaluation errors (syntax errors, runtime exceptions)
      // and structured clone failures (e.g. when exports contain functions,
      // Symbols, or other non-cloneable values). Both are returned as
      // { ok: false } results — the caller does not need to distinguish.
      const error =
        err instanceof Error
          ? { message: err.message, stack: err.stack ?? "" }
          : { message: String(err), stack: "" };

      // Flush partial dependencies that the loader hook tracked before the
      // error. This allows the evaluator to register them in the reverse
      // dep map so that fixing the broken file triggers re-evaluation.
      const deps = await requestDeps();
      if (!deps.includes(msg.absolutePath)) {
        deps.unshift(msg.absolutePath);
      }

      parentPort!.postMessage({
        type: "result",
        id: msg.id,
        ok: false,
        error,
        dependencies: deps,
      });
    }
  },
);

parentPort.postMessage({ type: "ready" });
