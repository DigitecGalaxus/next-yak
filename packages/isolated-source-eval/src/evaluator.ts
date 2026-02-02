import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { createLoaderDataUrl } from "./loader-hooks.ts";

export type EvaluateResult =
  | { ok: true; value: Record<string, unknown>; dependencies: string[] }
  | { ok: false; error: { message: string; stack: string } };

export interface Evaluator {
  /** Evaluate a module and return its exports plus the full transitive dependency list. */
  evaluate(absolutePath: string): Promise<EvaluateResult>;
  /** Clear cached results for every entry point that transitively depends on the given file. */
  invalidate(absolutePath: string): void;
  /** Clear the entire result cache and swap workers. */
  invalidateAll(): void;
  /** Return entry point paths that would be affected by invalidate(absolutePath). */
  getDependentsOf(absolutePath: string): string[];
  /** Terminate both workers and reject any pending evaluations. */
  dispose(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

/** Wire format for messages from the worker back to the main thread. */
type WorkerResult =
  | {
      type: "result";
      id: number;
      ok: true;
      value: Record<string, unknown>;
      dependencies: string[];
    }
  | {
      type: "result";
      id: number;
      ok: false;
      error: { message: string; stack: string };
    };

interface PendingEvaluation {
  id: number;
  absolutePath: string;
  resolve: (result: EvaluateResult) => void;
  reject: (error: Error) => void;
  /** Number of times this evaluation has been retried due to staleness detection. */
  retryCount: number;
}

/**
 * Resolves the worker entry point path.
 *
 * In production the compiled `.js` file exists in `dist/` — we prefer that.
 * During development (vitest runs against source), only the `.ts` file exists.
 * Node 24+ handles `.ts` natively via strip-types, so the fallback works
 * without any flags or loaders.
 */
function resolveWorkerPath(): string {
  const jsPath = fileURLToPath(new URL("./worker.js", import.meta.url));
  if (existsSync(jsPath)) {
    return jsPath;
  }
  return fileURLToPath(new URL("./worker.ts", import.meta.url));
}

/**
 * Boots a worker and returns a handle with a ready promise.
 *
 * The loader hook data URL is passed via `workerData` rather than having
 * the worker import it from a sibling module. This avoids a module
 * resolution mismatch: source files use `.ts` extensions (required by
 * Node 24 strip-types) while compiled output uses `.js` (rewritten by tsc
 * via `rewriteRelativeImportExtensions`). Since the worker file would need
 * to import loader-hooks with the right extension for its context, passing
 * the data URL through workerData eliminates the problem entirely.
 */
function bootWorker(): { worker: Worker; ready: Promise<void> } {
  const workerPath = resolveWorkerPath();
  const loaderDataUrl = createLoaderDataUrl();
  const worker = new Worker(workerPath, {
    workerData: { loaderDataUrl },
  });
  const ready = new Promise<void>((resolve) => {
    const onMessage = (msg: { type: string }) => {
      if (msg.type === "ready") {
        worker.off("message", onMessage);
        resolve();
      }
    };
    worker.on("message", onMessage);
  });
  return { worker, ready };
}

/** Default timeout for a single evaluation in milliseconds. */
const DEFAULT_EVAL_TIMEOUT_MS = 30_000;

/** Maximum number of staleness retries before giving up with an error. */
const MAX_STALENESS_RETRIES = 3;

/** Creates an evaluator that runs modules in isolated worker threads with dependency tracking. */
export async function createEvaluator(): Promise<Evaluator> {
  const resultCache = new Map<string, EvaluateResult>();

  /**
   * Two dependency maps provide O(1) lookups in both directions:
   *
   * - `reverseDeps`: file path → set of entry points that depend on it.
   *   Consulted during `invalidate()` to find which cached results to clear.
   *
   * - `forwardDeps`: entry point → set of all its transitive dependencies.
   *   Needed to clean up stale reverse entries when an entry point is
   *   re-evaluated and its dependency tree has changed (e.g. an import
   *   was removed). Without this, removed dependencies would accumulate
   *   phantom reverse entries that never get cleaned up.
   */
  const reverseDeps = new Map<string, Set<string>>();
  const forwardDeps = new Map<string, Set<string>>();

  let nextId = 0;
  let currentEval: PendingEvaluation | null = null;
  let currentTimeout: ReturnType<typeof setTimeout> | null = null;
  const queue: PendingEvaluation[] = [];
  /**
   * Tracks files passed to `invalidate()` while an evaluation is in-flight.
   * When an evaluation completes, `handleResult()` checks whether any reported
   * dependency intersects this set. If so, the result is stale — it's discarded,
   * workers are swapped, and the evaluation is retried on a clean worker.
   *
   * This closes the "cold start" gap: if `evaluate("A")` is dispatched before
   * `invalidate("B")` is called, and A depends on B, the dependency graph
   * doesn't know about A→B yet. Without this set, the invalidation would be
   * silently missed.
   *
   * Cleared in `swapWorkers()` because the new primary has a clean ESM cache.
   */
  const invalidatedDuringEval = new Set<string>();
  let disposed = false;

  /**
   * Two workers are maintained at all times:
   *
   * - **primary**: handles all evaluate() calls. Accumulates Node's ESM
   *   module cache over time, making repeated evaluations fast (~1-3ms).
   *
   * - **shadow**: pre-booted but completely idle. Never evaluates anything,
   *   so its module cache stays empty. On invalidation, the primary is
   *   terminated (stale cache) and the shadow is promoted to primary
   *   instantly (no boot latency). A new shadow is booted in the background.
   *
   * This pattern trades ~30ms of background boot time for instant
   * invalidation. The alternative — reusing a single worker and clearing
   * its ESM cache — isn't possible because Node doesn't expose an API
   * to clear the module cache.
   */
  let primary = bootWorker();
  let shadow = bootWorker();

  await Promise.all([primary.ready, shadow.ready]);

  function setupMessageHandler(workerObj: { worker: Worker }) {
    workerObj.worker.on("message", (msg: WorkerResult) => {
      if (msg.type !== "result") return;
      handleResult(msg);
    });

    workerObj.worker.on("error", (err: Error) => {
      if (currentEval) {
        clearEvalTimeout();
        const pending = currentEval;
        currentEval = null;
        const result: EvaluateResult = {
          ok: false,
          error: { message: err.message, stack: err.stack ?? "" },
        };
        updateDeps(pending.absolutePath, [pending.absolutePath]);
        resultCache.set(pending.absolutePath, result);
        pending.resolve(result);
        processQueue();
      }
    });
  }

  setupMessageHandler(primary);

  function clearEvalTimeout() {
    if (currentTimeout !== null) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
  }

  function handleResult(msg: WorkerResult) {
    if (!currentEval) return;
    if (msg.id !== currentEval.id) return;

    clearEvalTimeout();

    const pending = currentEval;
    currentEval = null;

    // Staleness check: if a file was invalidated while this evaluation was
    // in-flight and the result depends on it, discard the result and retry
    // on a clean worker. Only checked for successes — errors don't report
    // deps, and the file watcher will trigger another invalidation when the
    // source is fixed.
    if (msg.ok && invalidatedDuringEval.size > 0) {
      const isStale = msg.dependencies.some((dep) =>
        invalidatedDuringEval.has(dep),
      );
      if (isStale) {
        if (pending.retryCount >= MAX_STALENESS_RETRIES) {
          pending.resolve({
            ok: false,
            error: {
              message: `Evaluation of ${pending.absolutePath} exceeded maximum staleness retries (${MAX_STALENESS_RETRIES})`,
              stack: "",
            },
          });
          processQueue();
          return;
        }
        pending.retryCount++;
        swapWorkers();
        queue.unshift(pending);
        processQueue();
        return;
      }
    }

    let result: EvaluateResult;
    if (msg.ok) {
      result = { ok: true, value: msg.value, dependencies: msg.dependencies };
      updateDeps(pending.absolutePath, msg.dependencies);
    } else {
      result = { ok: false, error: msg.error };
      // Even for errors, track the entry point itself so that invalidation
      // can clear the cached error and allow a retry after the file is fixed.
      updateDeps(pending.absolutePath, [pending.absolutePath]);
    }

    resultCache.set(pending.absolutePath, result);
    pending.resolve(result);
    processQueue();
  }

  /**
   * Reconciles the dependency graph after an evaluation.
   *
   * First removes all old reverse entries for this entry point (using
   * forwardDeps as the source of truth), then writes the new forward
   * and reverse mappings. This ensures that if a dependency was removed
   * between evaluations, it no longer points back to this entry point.
   */
  function updateDeps(entryPoint: string, deps: string[]) {
    const oldDeps = forwardDeps.get(entryPoint);
    if (oldDeps) {
      for (const dep of oldDeps) {
        const entries = reverseDeps.get(dep);
        if (entries) {
          entries.delete(entryPoint);
          if (entries.size === 0) {
            reverseDeps.delete(dep);
          }
        }
      }
    }

    const depSet = new Set(deps);
    forwardDeps.set(entryPoint, depSet);

    for (const dep of depSet) {
      let entries = reverseDeps.get(dep);
      if (!entries) {
        entries = new Set();
        reverseDeps.set(dep, entries);
      }
      entries.add(entryPoint);
    }
  }

  /**
   * Evaluations are serialized — one at a time per worker. This prevents
   * interleaved dependency tracking: the loader hook accumulates deps in
   * a single Set and flushes it after each evaluation. Concurrent imports
   * would mix dependencies from different entry points.
   *
   * Waits for the primary worker to be ready before sending work. This
   * matters after a swap: the promoted shadow may still be booting.
   */
  function processQueue() {
    if (currentEval || queue.length === 0 || disposed) return;

    const next = queue.shift()!;
    currentEval = next;

    primary.ready.then(() => {
      if (disposed || currentEval !== next) return;
      primary.worker.postMessage({
        type: "evaluate",
        id: next.id,
        absolutePath: next.absolutePath,
      });

      currentTimeout = setTimeout(() => {
        if (currentEval !== next) return;
        currentEval = null;
        currentTimeout = null;

        const result: EvaluateResult = {
          ok: false,
          error: {
            message: `Evaluation of ${next.absolutePath} timed out after ${DEFAULT_EVAL_TIMEOUT_MS}ms`,
            stack: "",
          },
        };
        updateDeps(next.absolutePath, [next.absolutePath]);
        resultCache.set(next.absolutePath, result);
        next.resolve(result);

        swapWorkers();
        processQueue();
      }, DEFAULT_EVAL_TIMEOUT_MS);
    });
  }

  /**
   * Terminates the primary (stale module cache), promotes the shadow
   * (clean cache, instant), and boots a new shadow in the background.
   *
   * `removeAllListeners` prevents the terminated worker from delivering
   * late messages or error events that would confuse the result handler.
   */
  function swapWorkers() {
    primary.worker.removeAllListeners();
    primary.worker.terminate();

    primary = shadow;
    setupMessageHandler(primary);

    shadow = bootWorker();

    // The new primary has a clean ESM cache, so any previously tracked
    // invalidations are no longer relevant — the fresh worker will
    // re-import everything from disk.
    invalidatedDuringEval.clear();
  }

  function evaluate(absolutePath: string): Promise<EvaluateResult> {
    if (disposed) {
      return Promise.reject(new Error("Evaluator has been disposed"));
    }

    if (!isAbsolute(absolutePath)) {
      return Promise.reject(
        new Error(`evaluate() requires an absolute path, got: ${absolutePath}`),
      );
    }

    // The result cache is critical for correctness, not just performance.
    // The ESM loader hook only fires on cache misses — if a module was already
    // imported by this worker, its transitive dependencies won't be reported
    // again. By always returning the cached result here, we guarantee that
    // evaluate() never re-posts to a worker that would return incomplete deps.
    const cached = resultCache.get(absolutePath);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise<EvaluateResult>((resolve, reject) => {
      const id = nextId++;
      queue.push({ id, absolutePath, resolve, reject, retryCount: 0 });
      processQueue();
    });
  }

  function invalidate(absolutePath: string): void {
    // Always track the invalidation so that in-flight evaluations whose
    // dependency graph isn't populated yet (cold start) can detect staleness
    // when they complete in handleResult().
    invalidatedDuringEval.add(absolutePath);

    const entryPoints = reverseDeps.get(absolutePath);
    if (!entryPoints || entryPoints.size === 0) return;

    for (const entry of entryPoints) {
      resultCache.delete(entry);

      // Clean up the dependency graph for invalidated entry points.
      // Since we're about to swap workers and re-evaluate, the old graph
      // entries are stale. Cleaning them here prevents phantom reverse
      // entries from accumulating for removed dependencies.
      const deps = forwardDeps.get(entry);
      if (deps) {
        for (const dep of deps) {
          const entries = reverseDeps.get(dep);
          if (entries) {
            entries.delete(entry);
            if (entries.size === 0) {
              reverseDeps.delete(dep);
            }
          }
        }
        forwardDeps.delete(entry);
      }
    }

    // If an evaluation is in-flight on the worker we're about to terminate,
    // capture it and re-queue at the front. The caller's promise will
    // resolve transparently with the result from the promoted shadow worker.
    clearEvalTimeout();
    const inflight = currentEval;
    currentEval = null;

    swapWorkers();

    if (inflight) {
      queue.unshift(inflight);
    }

    processQueue();
  }

  function invalidateAll(): void {
    resultCache.clear();
    forwardDeps.clear();
    reverseDeps.clear();

    clearEvalTimeout();
    const inflight = currentEval;
    currentEval = null;

    swapWorkers();

    if (inflight) {
      queue.unshift(inflight);
    }

    processQueue();
  }

  function getDependentsOf(absolutePath: string): string[] {
    const entryPoints = reverseDeps.get(absolutePath);
    if (!entryPoints) return [];
    return [...entryPoints];
  }

  async function dispose(): Promise<void> {
    if (disposed) return;
    disposed = true;

    clearEvalTimeout();

    if (currentEval) {
      currentEval.reject(new Error("Evaluator has been disposed"));
      currentEval = null;
    }
    for (const pending of queue) {
      pending.reject(new Error("Evaluator has been disposed"));
    }
    queue.length = 0;

    await Promise.all([primary.worker.terminate(), shadow.worker.terminate()]);
  }

  return {
    evaluate,
    invalidate,
    invalidateAll,
    getDependentsOf,
    dispose,
    [Symbol.asyncDispose]: dispose,
  };
}
