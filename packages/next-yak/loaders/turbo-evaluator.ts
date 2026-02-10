/**
 * Turbopack evaluator adapter.
 *
 * Bridges the low-level `Evaluator` (worker-thread module evaluator) and
 * turbopack's loader lifecycle. A single `Evaluator` instance is kept as a
 * singleton on `globalThis` because turbopack may create multiple loader
 * instances that share the same process — `Symbol.for` keys guarantee all
 * instances converge on the same evaluator and mtime map.
 *
 * Invalidation uses synchronous mtime polling rather than `fs.watch` because
 * turbopack can re-run a loader before a filesystem watcher event fires,
 * which would cause the evaluator to return stale cached results.
 */
import { statSync } from "node:fs";
import type { Evaluator } from "../isolated-source-eval/evaluator.js";

const EVALUATOR_KEY = Symbol.for("next-yak-evaluator");
const MTIMES_KEY = Symbol.for("next-yak-mtimes");

type GlobalState = {
  [EVALUATOR_KEY]?: Promise<Evaluator>;
  [MTIMES_KEY]?: Map<string, number>;
};

function getGlobal(): GlobalState {
  return globalThis as unknown as GlobalState;
}

/**
 * Returns the shared evaluator, creating it on first call.
 *
 * Uses `Symbol.for` keys on `globalThis` so every turbopack loader instance
 * in the process converges on the same evaluator and mtime map. A
 * `beforeExit` handler terminates the worker threads when the process winds
 * down.
 */
export async function getOrCreateEvaluator(): Promise<Evaluator> {
  const globalState = getGlobal();
  if (!globalState[EVALUATOR_KEY]) {
    const evaluatorPromise = import("../isolated-source-eval/index.js").then(
      ({ createEvaluator }) => createEvaluator(),
    );
    globalState[EVALUATOR_KEY] = evaluatorPromise;
    globalState[MTIMES_KEY] = new Map();

    process.on("beforeExit", async () => {
      const evaluator = await evaluatorPromise;
      await evaluator.dispose();
      globalState[MTIMES_KEY]!.clear();
    });
  }
  return globalState[EVALUATOR_KEY]!;
}

/**
 * Synchronous mtime check replaces async fs.watch to avoid a race condition:
 * turbopack may re-run the loader before fs.watch fires, causing the evaluator
 * to return stale cached results. Checking mtimes synchronously before each
 * evaluation guarantees freshness.
 *
 * Uses surgical invalidation: only files whose mtimes actually changed are
 * passed to `invalidate()`, which uses the evaluator's reverse dependency
 * graph to evict only affected cached results with at most one worker swap.
 */
function invalidateChangedDeps(evaluator: Evaluator): void {
  const mtimes = getGlobal()[MTIMES_KEY]!;
  const changed: string[] = [];

  for (const [dep, lastMtime] of mtimes) {
    try {
      const currentMtime = statSync(dep).mtimeMs;
      if (currentMtime !== lastMtime) {
        changed.push(dep);
        mtimes.set(dep, currentMtime);
      }
    } catch {
      changed.push(dep);
      mtimes.delete(dep);
    }
  }

  if (changed.length > 0) {
    evaluator.invalidate(...changed);
  }
}

/** Snapshots the current mtimes of `deps` so the next evaluation can detect changes. */
function recordMtimes(deps: string[]): void {
  const mtimes = getGlobal()[MTIMES_KEY]!;
  for (const dep of deps) {
    try {
      mtimes.set(dep, statSync(dep).mtimeMs);
    } catch {
      /* file may not exist */
    }
  }
}

/**
 * Evaluates a yak module and returns its exports.
 *
 * Before evaluation, checks whether any previously recorded dependency has
 * changed on disk and invalidates the evaluator cache if so. After a
 * successful evaluation, records fresh mtimes and notifies the caller of
 * every transitive dependency via `onDependency`.
 *
 * @param modulePath  Absolute path to the module to evaluate.
 * @param onDependency  Called once per transitive dependency so the loader
 *   can register file watchers with turbopack.
 * @returns The module's exported values.
 * @throws If the evaluated module throws at runtime — the original stack
 *   trace from the worker thread is preserved.
 */
export async function evaluateYakModule(
  modulePath: string,
  onDependency?: (dep: string) => void,
): Promise<Record<string, unknown>> {
  const evaluator = await getOrCreateEvaluator();
  invalidateChangedDeps(evaluator);
  const result = await evaluator.evaluate(modulePath);
  if (!result.ok) {
    const error = new Error(result.error.message);
    if (result.error.stack) {
      error.stack = result.error.stack;
    }
    throw error;
  }
  recordMtimes(result.dependencies);
  if (onDependency) {
    for (const dep of result.dependencies) {
      onDependency(dep);
    }
  }
  return result.value;
}
