import type { FrameworkId } from "../frameworks";
import type { Runtime } from "./types";

/** Each runtime is its own chunk, so the preview downloads only the framework it shows. */
const loaders: Record<FrameworkId, () => Promise<Runtime>> = {
  react: () => import("./react").then((module) => module.runtime),
  solid: () => import("./solid").then((module) => module.runtime),
};

const cache = new Map<FrameworkId, Promise<Runtime>>();

export function loadRuntime(framework: FrameworkId): Promise<Runtime> {
  let runtime = cache.get(framework);
  if (!runtime) {
    runtime = loaders[framework]();
    cache.set(framework, runtime);
  }
  return runtime;
}
