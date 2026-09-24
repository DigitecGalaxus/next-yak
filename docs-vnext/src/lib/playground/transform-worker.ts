import init, { start, transform } from "./wasm";
import { transformAll } from "./transform";
import type { WorkerRequest, WorkerResponse } from "./types";

/**
 * The compiler runs in a worker, so a slow compile never blocks typing in the editor.
 *
 * The WASM file is about 9 MB. The explicit URL lets the bundler copy it next to the
 * worker, under the site's base path, so it loads the same on localhost and on GitHub Pages.
 */
const post = (message: WorkerResponse) => self.postMessage(message);

const ready = init({ module_or_path: new URL("./wasm/index_bg.wasm", import.meta.url) }).then(
  () => {
    start();
    post({ type: "ready" });
  },
);

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, files, options } = event.data;
  await ready;
  try {
    post({ type: "result", id, files: await transformAll(transform, files, options) });
  } catch (error) {
    post({ type: "error", id, message: error instanceof Error ? error.message : String(error) });
  }
});
