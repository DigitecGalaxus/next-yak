/**
 * Turbopack evaluator adapter.
 *
 * Bridges the low-level `Evaluator` (worker-thread module evaluator) and
 * turbopack's loader lifecycle. A single `Evaluator` instance is kept as a
 * singleton on `globalThis` because turbopack may create multiple loader
 * instances that share the same process — `Symbol.for` keys guarantee all
 * instances converge on the same evaluator and modification time map.
 *
 * Invalidation uses synchronous modification time polling rather than `fs.watch` because
 * turbopack can re-run a loader before a filesystem watcher event fires,
 * which would cause the evaluator to return stale cached results.
 */
import { statSync } from "node:fs";
import type { Evaluator } from "../isolated-source-eval/evaluator.js";

const EVALUATOR_KEY = Symbol.for("next-yak-evaluator");
const MTIMES_KEY = Symbol.for("next-yak-mtimes");

/**
 * A shared `Map` of file paths to their last known modification times, used to detect changes on disk
 *
 * e.g. bar.ts -> 1680000000000 (Sat Mar 28 2024 12:00:00 GMT+0000)
 *
 * fs.fileWatch is not used as it might be out of sync with turbopacks own file watching also turbopack
 * spawns a loader pool which could cause a lot of file watchers to be created which can cause performance issues and hitting OS limits
 */
const getFileModificationTimes = () =>
  ((globalThis as typeof globalThis & { [MTIMES_KEY]?: Map<string, number> })[
    MTIMES_KEY
  ] ??= new Map<string, number>());

/**
 * Returns the shared evaluator, creating it on first call.
 *
 * Uses `Symbol.for` keys on `globalThis` so every turbopack loader instance
 * in the process converges on the same evaluator and modification time map. A
 * `beforeExit` handler terminates the worker threads when the process winds
 * down.
 */
export const getEvaluatorSingleton = async (): Promise<Evaluator> => {
  const processGlobal = globalThis as typeof globalThis & {
    [EVALUATOR_KEY]?: Promise<Evaluator>;
  };
  if (!processGlobal[EVALUATOR_KEY]) {
    processGlobal[EVALUATOR_KEY] =
      import("../isolated-source-eval/index.js").then(({ createEvaluator }) =>
        createEvaluator(),
      );
    // Kill the worker threads when the process exits
    process.on("beforeExit", async () => {
      const evaluator = await processGlobal[EVALUATOR_KEY]!;
      await evaluator.dispose();
    });
  }
  return processGlobal[EVALUATOR_KEY]!;
};

/**
 * Turbopack runs the loader for the same compilation file-by-file, but multiple files can share the
 * same dependency. This function detects which dependencies actually changed
 * on disk and invalidates them once — this prevents re-evaluating the same module multiple times in the same compilation
 */
function invalidateDependenciesWithDiskModifications(
  evaluator: Evaluator,
): void {
  const modificationTimes = getFileModificationTimes();
  const modifiedDependencies: string[] = [];
  for (const [dep, lastModificationTime] of modificationTimes) {
    try {
      const currentModificationTime = statSync(dep).mtimeMs;
      if (currentModificationTime !== lastModificationTime) {
        modifiedDependencies.push(dep);
        modificationTimes.set(dep, currentModificationTime);
      }
    } catch {
      modifiedDependencies.push(dep);
      modificationTimes.delete(dep);
    }
  }
  if (modifiedDependencies.length > 0) {
    evaluator.invalidate(...modifiedDependencies);
  }
}

/** Snapshots the current modification times of `deps` so the next evaluation can detect changes. */
function recordModificationTimes(deps: string[]): void {
  const modificationTimes = getFileModificationTimes();
  for (const dep of deps) {
    try {
      modificationTimes.set(dep, statSync(dep).mtimeMs);
    } catch {
      /* file may not exist */
    }
  }
}

/**
 * Creates an evaluator function scoped to a single loader invocation.
 *
 * Before evaluation, checks whether any previously recorded dependency has
 * changed on disk and invalidates the evaluator cache if so. After a
 * successful evaluation, records fresh modification times and notifies the caller of
 * every transitive dependency via `onDependency`.
 *
 * @returns A function that evaluates a yak module and returns its exports.
 *   The returned function accepts:
 *   - `modulePath` — absolute path to the module to evaluate.
 *   - `onDependency` — called once per transitive dependency so the loader
 *     can register file watchers with turbopack.
 * @throws If the evaluated module throws at runtime — the original stack
 *   trace from the worker thread is preserved.
 */
export async function createCompilationEvaluator(): Promise<
  (
    modulePath: string,
    onDependency?: (dep: string) => void,
  ) => Promise<Record<string, unknown>>
> {
  const evaluator = await getEvaluatorSingleton();
  invalidateDependenciesWithDiskModifications(evaluator);

  return async (modulePath, onDependency?) => {
    const result = await evaluator.evaluate(modulePath);
    if (!result.ok) {
      const error = new Error(result.error.message);
      if (result.error.stack) {
        error.stack = result.error.stack;
      }
      throw error;
    }
    // Store times of newly discovered dependencies for next compilation
    recordModificationTimes(result.dependencies);
    if (onDependency) {
      for (const dep of result.dependencies) {
        onDependency(dep);
      }
    }
    return result.value;
  };
}
