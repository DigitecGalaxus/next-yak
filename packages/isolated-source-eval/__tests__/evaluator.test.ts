import { describe, it, expect, afterEach } from "vitest";
import { resolve, join } from "node:path";
import { createEvaluator, type Evaluator } from "../src/index.ts";

const fixtures = resolve(import.meta.dirname, "fixtures");
const fixture = (name: string) => resolve(fixtures, name);

let evaluator: Evaluator;

afterEach(async () => {
  if (evaluator) {
    await evaluator.dispose();
  }
});

describe("createEvaluator", () => {
  it("creates an evaluator instance", async () => {
    evaluator = await createEvaluator();
    expect(evaluator).toBeDefined();
    expect(typeof evaluator.evaluate).toBe("function");
    expect(typeof evaluator.invalidate).toBe("function");
    expect(typeof evaluator.invalidateAll).toBe("function");
    expect(typeof evaluator.getDependentsOf).toBe("function");
    expect(typeof evaluator.dispose).toBe("function");
  });
});

describe("evaluate", () => {
  it("evaluates a simple TypeScript theme file", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("simple-theme.ts"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.fontSize).toBe(16);
    expect(result.value.fontFamily).toBe("Arial, sans-serif");
    expect(result.value.default).toEqual({
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
    });
  });

  it("evaluates a plain JavaScript file", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("simple-theme.js"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.fontSize).toBe(16);
    expect(result.value.default).toEqual({
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
    });
  });

  it("evaluates a file with transitive dependencies", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("transitive-theme.ts"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.theme).toEqual({
      color: "#ff0000",
      padding: "8px",
    });

    // Should include both the entry and the transitive dep
    expect(result.dependencies).toContain(fixture("transitive-theme.ts"));
    expect(result.dependencies).toContain(fixture("tokens.ts"));
  });

  it("evaluates computed values", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("computed-values.ts"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.small).toBe(8);
    expect(result.value.medium).toBe(16);
    expect(result.value.large).toBe(24);
    expect(typeof result.value.timestamp).toBe("number");
  });

  it("returns an error for syntax errors", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("syntax-error.ts"));

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.message).toBeDefined();
    expect(typeof result.error.message).toBe("string");
  });

  it("returns an error for non-serializable exports", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("non-serializable.ts"));

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.message).toMatch(
      /could not be cloned|is not a function/i,
    );
  });

  it("rejects relative paths", async () => {
    evaluator = await createEvaluator();
    await expect(evaluator.evaluate("./relative.ts")).rejects.toThrow(
      "absolute path",
    );
  });

  it("excludes node_modules from dependencies", async () => {
    evaluator = await createEvaluator();
    const result = await evaluator.evaluate(fixture("uses-node-modules.ts"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.result).toBe(join("foo", "bar"));

    // Should only include the entry point, not node:path
    expect(result.dependencies).toEqual([fixture("uses-node-modules.ts")]);
  });
});

describe("caching", () => {
  it("returns the same cached result on subsequent calls", async () => {
    evaluator = await createEvaluator();
    const result1 = await evaluator.evaluate(fixture("simple-theme.ts"));
    const result2 = await evaluator.evaluate(fixture("simple-theme.ts"));

    expect(result1).toBe(result2); // Same reference
  });

  it("caches error results too", async () => {
    evaluator = await createEvaluator();
    const result1 = await evaluator.evaluate(fixture("syntax-error.ts"));
    const result2 = await evaluator.evaluate(fixture("syntax-error.ts"));

    expect(result1).toBe(result2); // Same reference
    expect(result1.ok).toBe(false);
  });
});

describe("invalidation", () => {
  it("clears cache for affected entry points", async () => {
    evaluator = await createEvaluator();
    const result1 = await evaluator.evaluate(fixture("transitive-theme.ts"));

    evaluator.invalidate(fixture("tokens.ts"));

    const result2 = await evaluator.evaluate(fixture("transitive-theme.ts"));

    expect(result1).not.toBe(result2); // Different reference (re-evaluated)
    expect(result2.ok).toBe(true);
  });

  it("is a no-op for untracked files", async () => {
    evaluator = await createEvaluator();
    const result1 = await evaluator.evaluate(fixture("simple-theme.ts"));

    // Invalidating an unrelated file should not affect cache
    evaluator.invalidate("/some/untracked/file.ts");

    const result2 = await evaluator.evaluate(fixture("simple-theme.ts"));
    expect(result1).toBe(result2); // Same reference
  });

  it("retries in-flight evaluation transparently when invalidated mid-flight", async () => {
    evaluator = await createEvaluator();

    // Start a slow evaluation that will be in-flight when we invalidate
    const promise = evaluator.evaluate(fixture("slow-module.ts"));

    // Give the worker time to start the import but not finish it
    await new Promise((r) => setTimeout(r, 100));

    // Invalidate while the evaluation is in-flight
    evaluator.invalidate(fixture("slow-module.ts"));

    // The promise should still resolve successfully (retried on the shadow worker)
    const result = await promise;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("slow");
    }
  });

  it("detects cold-start invalidation and retries on clean worker", async () => {
    evaluator = await createEvaluator();

    // Start evaluating a slow module that depends on tokens.ts
    const promise = evaluator.evaluate(fixture("slow-transitive.ts"));

    // Wait for the evaluation to start but not finish (slow-transitive delays 200ms)
    await new Promise((r) => setTimeout(r, 50));

    // Invalidate tokens.ts before the evaluation completes.
    // The dependency graph doesn't know about slow-transitive → tokens yet,
    // but the invalidation should be tracked and detected when the eval finishes.
    evaluator.invalidate(fixture("tokens.ts"));

    const result = await promise;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.color).toBe("#ff0000");
    }
  });

  it("cleans up reverseDeps after invalidation", async () => {
    evaluator = await createEvaluator();
    await evaluator.evaluate(fixture("transitive-theme.ts"));

    // tokens.ts should be tracked as a dependency
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toContain(
      fixture("transitive-theme.ts"),
    );

    // After invalidation, the graph should be cleaned up
    evaluator.invalidate(fixture("tokens.ts"));
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toEqual([]);

    // Re-evaluation should rebuild the graph
    const result = await evaluator.evaluate(fixture("transitive-theme.ts"));
    expect(result.ok).toBe(true);
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toContain(
      fixture("transitive-theme.ts"),
    );
  });

  it("correctly rebuilds graph for multiple entry points sharing a dependency", async () => {
    evaluator = await createEvaluator();

    // Both transitive-theme and alt-theme depend on tokens.ts
    await evaluator.evaluate(fixture("transitive-theme.ts"));
    await evaluator.evaluate(fixture("alt-theme.ts"));

    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toHaveLength(2);

    // Invalidating tokens.ts clears the graph for both entry points
    evaluator.invalidate(fixture("tokens.ts"));
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toEqual([]);

    // Re-evaluate both — graph should be fully rebuilt
    const r1 = await evaluator.evaluate(fixture("transitive-theme.ts"));
    const r2 = await evaluator.evaluate(fixture("alt-theme.ts"));
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    // Both should be tracked again
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toHaveLength(2);

    // A second invalidation of tokens.ts should still clear both
    evaluator.invalidate(fixture("tokens.ts"));
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toEqual([]);

    // And re-evaluation still works
    const r3 = await evaluator.evaluate(fixture("transitive-theme.ts"));
    expect(r3.ok).toBe(true);
    expect(r3).not.toBe(r1);
  });

  it("handles double invalidation correctly", async () => {
    evaluator = await createEvaluator();
    await evaluator.evaluate(fixture("transitive-theme.ts"));

    // Two synchronous invalidations of the same file
    evaluator.invalidate(fixture("tokens.ts"));
    evaluator.invalidate(fixture("tokens.ts"));

    // Should still re-evaluate correctly
    const result = await evaluator.evaluate(fixture("transitive-theme.ts"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.theme).toEqual({
        color: "#ff0000",
        padding: "8px",
      });
    }
  });

  it("tracks transitive deps on error so invalidation recovers", async () => {
    evaluator = await createEvaluator();

    // transitive-error.ts imports tokens.ts then throws
    const result1 = await evaluator.evaluate(fixture("transitive-error.ts"));
    expect(result1.ok).toBe(false);

    // tokens.ts should still be tracked as a dependency despite the error
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toContain(
      fixture("transitive-error.ts"),
    );

    // Invalidating the transitive dep should clear the cached error
    evaluator.invalidate(fixture("tokens.ts"));

    // Re-evaluation should produce a fresh result (re-runs on new worker,
    // will still error since the fixture always throws — but it's a new result)
    const result2 = await evaluator.evaluate(fixture("transitive-error.ts"));
    expect(result2.ok).toBe(false);
    expect(result2).not.toBe(result1);
  });

  it("invalidateAll clears entire cache", async () => {
    evaluator = await createEvaluator();
    const result1 = await evaluator.evaluate(fixture("simple-theme.ts"));

    evaluator.invalidateAll();

    const result2 = await evaluator.evaluate(fixture("simple-theme.ts"));
    expect(result1).not.toBe(result2); // Different reference
  });
});

describe("getDependentsOf", () => {
  it("returns entry points that depend on a file", async () => {
    evaluator = await createEvaluator();
    await evaluator.evaluate(fixture("transitive-theme.ts"));

    const dependents = evaluator.getDependentsOf(fixture("tokens.ts"));
    expect(dependents).toContain(fixture("transitive-theme.ts"));
  });

  it("returns multiple entry points that share a dependency", async () => {
    evaluator = await createEvaluator();
    await evaluator.evaluate(fixture("transitive-theme.ts"));
    await evaluator.evaluate(fixture("alt-theme.ts"));

    const dependents = evaluator.getDependentsOf(fixture("tokens.ts"));
    expect(dependents).toContain(fixture("transitive-theme.ts"));
    expect(dependents).toContain(fixture("alt-theme.ts"));
    expect(dependents).toHaveLength(2);
  });

  it("returns empty array for untracked files", async () => {
    evaluator = await createEvaluator();
    const dependents = evaluator.getDependentsOf("/some/untracked/file.ts");
    expect(dependents).toEqual([]);
  });
});

describe("dispose", () => {
  it("rejects evaluations after dispose", async () => {
    evaluator = await createEvaluator();
    await evaluator.dispose();

    await expect(
      evaluator.evaluate(fixture("simple-theme.ts")),
    ).rejects.toThrow("disposed");
  });

  it("supports Symbol.asyncDispose", async () => {
    const ev = await createEvaluator();
    expect(typeof ev[Symbol.asyncDispose]).toBe("function");
    await ev[Symbol.asyncDispose]();

    await expect(ev.evaluate(fixture("simple-theme.ts"))).rejects.toThrow(
      "disposed",
    );
  });
});

describe("concurrent evaluations", () => {
  it("concurrent evaluate() calls for the same path return full dependencies", async () => {
    evaluator = await createEvaluator();

    // Two concurrent calls for the same transitive module
    const [r1, r2] = await Promise.all([
      evaluator.evaluate(fixture("transitive-theme.ts")),
      evaluator.evaluate(fixture("transitive-theme.ts")),
    ]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;

    // Both should return the same value
    expect(r1.value).toEqual(r2.value);

    // Both should include the transitive dependency
    expect(r1.dependencies).toContain(fixture("tokens.ts"));
    expect(r2.dependencies).toContain(fixture("tokens.ts"));
  });

  it("concurrent evaluate() calls followed by invalidation of transitive dep still works", async () => {
    evaluator = await createEvaluator();

    // Two concurrent calls — same scenario as the vite plugin where
    // App.tsx.css and ButtonB.tsx.css both evaluate tokens.yak.ts
    const [r1, r2] = await Promise.all([
      evaluator.evaluate(fixture("transitive-theme.ts")),
      evaluator.evaluate(fixture("transitive-theme.ts")),
    ]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    // The transitive dep (tokens.ts) should be tracked in the reverse dep map
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toContain(
      fixture("transitive-theme.ts"),
    );

    // Invalidating the transitive dep should clear the cache
    evaluator.invalidate(fixture("tokens.ts"));

    // Re-evaluation should produce a fresh result (different reference)
    const r3 = await evaluator.evaluate(fixture("transitive-theme.ts"));
    expect(r3.ok).toBe(true);
    expect(r3).not.toBe(r1);

    // And the dependency graph should be rebuilt
    expect(evaluator.getDependentsOf(fixture("tokens.ts"))).toContain(
      fixture("transitive-theme.ts"),
    );
  });

  it("handles multiple evaluate() calls correctly (serialized)", async () => {
    evaluator = await createEvaluator();

    const [r1, r2, r3] = await Promise.all([
      evaluator.evaluate(fixture("simple-theme.ts")),
      evaluator.evaluate(fixture("computed-values.ts")),
      evaluator.evaluate(fixture("uses-node-modules.ts")),
    ]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);

    if (r1.ok) expect(r1.value.fontSize).toBe(16);
    if (r2.ok) expect(r2.value.medium).toBe(16);
    if (r3.ok) expect(r3.value.result).toBe(join("foo", "bar"));
  });
});
