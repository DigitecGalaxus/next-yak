import { transformAll } from "@/lib/execute-code";
import type { transform } from "playground-wasm";

export type TWorkerMess = number[];

let transformExec: typeof transform;

const run = async () => {
  const { default: init, start, transform } = await import("playground-wasm");
  await init();
  start();
  transformExec = transform;
};

const onmessage = async (event: MessageEvent<any>) => {
  console.log("🐝 Worker: Message received from main script");
  const code = event.data;

  const response = await transformAll(
    transformExec,
    code["file:///index.tsx"],
    [
      {
        name: "file:///other.tsx",
        content: code["file:///other.tsx"],
      },
      {
        name: "file:///different.yak.ts",
        content: code["file:///different.yak.ts"],
      },
    ],
  );
  console.log("🐝 Worker: Posting message back to main script");

  console.log({ response });

  postMessage(response);
};

run().then(() => addEventListener("message", onmessage));
