import type { Compiler } from "webpack";
import type { Evaluator } from "../isolated-source-eval/index.js";

export class YakEvaluatorPlugin {
  apply(compiler: Compiler & { yakEvaluator?: Evaluator }) {
    const evaluatorPromise = import("../isolated-source-eval/index.js").then(
      ({ createEvaluator }) => createEvaluator(),
    );

    compiler.hooks.beforeCompile.tapPromise("YakEvaluatorPlugin", async () => {
      compiler.yakEvaluator = await evaluatorPromise;
    });

    compiler.hooks.watchRun.tapPromise("YakEvaluatorPlugin", async () => {
      const evaluator = await evaluatorPromise;
      if (compiler.modifiedFiles) {
        for (const file of compiler.modifiedFiles) {
          evaluator.invalidate(file);
        }
      }
    });

    compiler.hooks.shutdown.tapPromise("YakEvaluatorPlugin", async () => {
      const evaluator = await evaluatorPromise;
      await evaluator.dispose();
    });
  }
}
