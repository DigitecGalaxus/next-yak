import { transformAll } from "@/lib/transformation/execute-code";
import type { TranspileInput } from "@/lib/transformation/useTranspile";
import type { transform } from "../../../playground-wasm/out";

export type TWorkerMess = number[];

let transformFn: typeof transform;

const initializeWasm = async (wasmUrl?: string) => {
  const {
    default: init,
    start,
    transform,
  } = await import("../../../playground-wasm/out");
  if (wasmUrl) {
    await init(wasmUrl);
  } else {
    await init();
  }
  start();
  transformFn = transform;
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

addEventListener(
  "message",
  async (event: MessageEvent) => {
    if (event.data?.type === "init") {
      try {
        await initializeWasm(event.data.wasmUrl);
        self.postMessage("workerReady");
      } catch (e) {
        // If loading external WASM failed, fall back to bundled WASM
        if (event.data.wasmUrl) {
          try {
            await initializeWasm();
            self.postMessage("workerReady");
          } catch (fallbackError) {
            self.postMessage(
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
            );
          }
        } else {
          self.postMessage(
            e instanceof Error ? e.message : String(e),
          );
        }
      }
      addEventListener("message", onmessage);
    }
  },
  { once: true },
);
