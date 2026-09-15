// Worker shim: bundles the shared evaluator worker into this package's dist
// (see resolveWorkerPath in yak-internals).
//
// a .yak.ts file imports "@yak/qwik", whose public entry loads @qwik.dev/core;
// core reads a build-time define at module load that only qwikVite injects,
// so the worker provides it before the file is evaluated
(globalThis as { __EXPERIMENTAL__?: object }).__EXPERIMENTAL__ ??= {};
export * from "yak-internals/isolated-source-eval/worker";
