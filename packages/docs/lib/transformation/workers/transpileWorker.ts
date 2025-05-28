import { transformAll } from "@/lib/transformation/execute-code";
import type { TranspileInput } from "@/lib/transformation/useTranspile";
import type { transform } from "../../../playground-wasm/out";

export type TWorkerMess = number[];

let transformFn: typeof transform;

const initializeWasm = async () => {
  const {
    default: init,
    start,
    transform,
  } = await import("../../../playground-wasm/out");
  await init();
  start();
  transformFn = transform;
  self.postMessage("workerReady");
};

const onmessage = async (event: MessageEvent<TranspileInput>) => {
  const { mainFile, additionalFiles, options } = event.data;

  try {
    const response = await transformAll(
      transformFn,
      mainFile.name,
      // add React so that the transformation is valid and can be run, but we don't need it in the editor
      'import React from "react";\n' + mainFile.content,
      additionalFiles?.map(({ name, content }) => ({
        name,
        content,
      })) ?? [],
      options,
    );
    postMessage(response);
  } catch (error) {
    if (typeof error === "string") {
      postMessage(error);
    } else if (error instanceof Error) {
      postMessage(error.message);
    }
  }
};

initializeWasm().then(() => {
  addEventListener("message", onmessage);
});
