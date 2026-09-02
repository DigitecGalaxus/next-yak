// Entry shim: bundles the shared evaluator into this package's dist so the
// worker file is emitted as its sibling (see resolveWorkerPath in yak-internals)
export { createEvaluator } from "yak-internals/isolated-source-eval";
export type { EvaluateResult, Evaluator } from "yak-internals/isolated-source-eval";
