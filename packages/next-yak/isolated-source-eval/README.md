# isolated-source-eval

> Internal module of next-yak. Not published as a standalone package.

Evaluate TypeScript and JavaScript modules in isolated worker threads. Get back serializable exports and a full transitive dependency list — used by the Vite plugin to evaluate user code at build time without polluting the host process.

```ts
import { createEvaluator } from "./isolated-source-eval/index.ts";

const evaluator = await createEvaluator();

const result = await evaluator.evaluate("/absolute/path/to/theme.ts");

if (result.ok) {
  result.value;        // { default: ..., namedExport: ... }
  result.dependencies; // ["/absolute/path/to/theme.ts", "/absolute/path/to/tokens.ts"]
} else {
  result.error;        // { message: string, stack: string }
}
```

## How it works

```mermaid
sequenceDiagram
    participant You as Your Code
    participant E as Evaluator
    participant P as Primary Worker
    participant S as Shadow Worker

    Note over E,S: createEvaluator() boots both workers

    You->>E: evaluate("theme.ts")
    E->>P: import("theme.ts")
    Note right of P: theme.ts imports tokens.ts<br/>Loader hook tracks both files
    P-->>E: { value, dependencies }
    E-->>You: { ok: true, value, dependencies }

    You->>E: evaluate("theme.ts")
    Note over E: Cache hit
    E-->>You: cached result (instant)

    You->>E: invalidate("tokens.ts")
    Note over E: tokens.ts is a dep of theme.ts<br/>→ clear theme.ts from cache
    E-xP: terminate (stale cache)
    Note over E,S: Shadow promoted to Primary<br/>New Shadow boots in background
    S->>P: promoted

    You->>E: evaluate("theme.ts")
    E->>P: import("theme.ts")
    Note right of P: Fresh module cache<br/>picks up file changes
    P-->>E: { value, dependencies }
    E-->>You: { ok: true, value, dependencies }
```

### Invalidation flows

There are two invalidation scenarios depending on whether the dependency graph is populated:

**Standard invalidation** — the dependency graph knows about the relationship (e.g. A was already evaluated and depends on B). When B is invalidated, the evaluator clears A's cached result, cleans up the dependency graph, swaps workers (terminating the stale primary), and re-queues any in-flight evaluation.

**Cold-start invalidation** — the dependency graph doesn't know about the relationship yet (e.g. `evaluate("A")` is dispatched, then `invalidate("B")` is called before A finishes, but A depends on B). In this case, `invalidate()` tracks B in an internal set. When A's evaluation completes and reports its dependencies, `handleResult()` detects that B is in the set, discards the stale result, swaps workers, and retries automatically.

```mermaid
sequenceDiagram
    participant You as Your Code
    participant E as Evaluator
    participant P1 as Primary 1
    participant P2 as Primary 2 (was Shadow)

    You->>E: evaluate("A.ts")
    E->>P1: import("A.ts")
    Note right of P1: A.ts imports B.ts<br/>Still loading...

    You->>E: invalidate("B.ts")
    Note over E: No known dependents yet<br/>→ track B.ts in staleness set

    P1-->>E: { value, deps: [A.ts, B.ts] }
    Note over E: B.ts in staleness set!<br/>→ result is stale

    E-xP1: terminate (stale cache)
    Note over E: Swap workers (clears set)
    E->>P2: import("A.ts") (retry)
    P2-->>E: { value, deps: [A.ts, B.ts] }
    E-->>You: { ok: true, value, deps }
```

Each evaluator manages two Node.js worker threads — a **primary** that handles evaluations and a **shadow** that sits idle with a clean module cache.

Modules are loaded via native `import()`. A custom ESM loader hook (registered via `module.register()`) intercepts every resolve call to build the dependency tree. Only project source files are tracked — `node_modules` are excluded.

When a file changes, call `invalidate()`. The primary worker (with its stale ESM cache) is terminated, the shadow is promoted instantly, and a new shadow boots in the background. No restart latency.

Node 24+ strips TypeScript types natively, so `.ts` files work without compilation.

## API

### `createEvaluator()`

Creates an evaluator instance. Boots both workers and waits until they're ready.

```ts
const evaluator = await createEvaluator();
```

Supports `await using` for automatic cleanup:

```ts
await using evaluator = await createEvaluator();
```

### `evaluator.evaluate(absolutePath)`

Evaluates a module and returns its exports plus the full transitive dependency list. Results are cached — subsequent calls with the same path return instantly until invalidated.

```ts
const result = await evaluator.evaluate("/project/src/theme.ts");
```

Returns a discriminated union:

```ts
type EvaluateResult =
  | { ok: true; value: Record<string, unknown>; dependencies: string[] }
  | { ok: false; error: { message: string; stack: string } };
```

Concurrent calls are queued and executed one at a time to keep dependency tracking accurate.

### `evaluator.invalidate(absolutePath)`

Clears cached results for every entry point that transitively depends on the given file, then swaps workers to ensure a clean module cache. If an evaluation is in-flight, it's transparently retried on the fresh worker.

```ts
evaluator.invalidate("/project/src/tokens.ts");
```

Silent no-op if the path isn't in any tracked dependency set.

### `evaluator.invalidateAll()`

Clears the entire result cache and swaps workers.

```ts
evaluator.invalidateAll();
```

### `evaluator.getDependentsOf(absolutePath)`

Returns the entry point paths that would be affected by `invalidate(absolutePath)`. Useful for debugging dependency tracking.

```ts
evaluator.getDependentsOf("/project/src/tokens.ts");
// ["/project/src/theme.ts", "/project/src/dark-theme.ts"]
```

### `evaluator.dispose()`

Terminates both workers and rejects any pending evaluations. Also implemented as `Symbol.asyncDispose`.

```ts
await evaluator.dispose();
```

## Constraints

| Constraint | Detail |
|---|---|
| Node 24+ | Required for stable type stripping. |
| Serializable exports only | Uses `postMessage` (structured clone). Functions, Symbols, WeakMaps, and class instances will produce an `{ ok: false }` error. Export plain data instead. |
| No sandboxing | Evaluated code runs with full Node.js privileges. This is designed for trusted project source files. |
| No file watching | This package does not watch the filesystem. Consumers are responsible for calling `invalidate()` when files change. |
| Type stripping only | TypeScript enums, namespaces, and parameter properties are not supported — only type annotations are stripped. |
| Error caching | Evaluation errors (syntax errors, non-serializable exports) are cached like successes. Call `invalidate()` after fixing the source file to clear the cached error and allow a retry. |

## License

MIT
