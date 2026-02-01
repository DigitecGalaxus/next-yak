# isolated-source-eval

Evaluate TypeScript and JavaScript modules in isolated worker threads. Get back serializable exports and a full transitive dependency list — useful for bundler plugins, dev servers, and build tools that need to execute user code without polluting the host process

```ts
import { createEvaluator } from "isolated-source-eval";

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

Each evaluator manages two Node.js worker threads — a **primary** that handles evaluations and a **shadow** that sits idle with a clean module cache.

Modules are loaded via native `import()`. A custom ESM loader hook (registered via `module.register()`) intercepts every resolve call to build the dependency tree. Only project source files are tracked — `node_modules` are excluded.

When a file changes, call `invalidate()`. The primary worker (with its stale ESM cache) is terminated, the shadow is promoted instantly, and a new shadow boots in the background. No restart latency.

Node 24+ strips TypeScript types natively, so `.ts` files work without compilation.

## Install

```bash
npm install isolated-source-eval
```

Requires **Node.js >= 24.0.0**.

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
