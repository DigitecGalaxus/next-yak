"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runModules } from "./run-module";
import { loadRuntime } from "./runtimes";
import type { Runtime } from "./runtimes/types";
import type { FrameworkId } from "./frameworks";
import type {
  PlaygroundFile,
  TransformOptions,
  TransformedFile,
  WorkerRequest,
  WorkerResponse,
} from "./types";

type CompilerState = {
  status: "loading" | "ready";
  /** the last output that compiled and ran, kept while the code has an error */
  files: TransformedFile[];
  /** the runtime and the main file's default export, which the preview renders with it */
  result: { runtime: Runtime; exported: unknown } | null;
  error: string | null;
};

/** Compiles in a worker and runs the result. Only the answer to the newest request counts. */
export function useCompiler(): [
  CompilerState,
  (framework: FrameworkId, files: PlaygroundFile[], options: TransformOptions) => void,
] {
  const worker = useRef<Worker | null>(null);
  const latest = useRef(0);
  const [state, setState] = useState<CompilerState>({
    status: "loading",
    files: [],
    result: null,
    error: null,
  });

  useEffect(() => {
    const instance = new Worker(new URL("./transform-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = instance;

    instance.addEventListener("message", async (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === "ready") {
        setState((s) => ({ ...s, status: "ready" }));
        return;
      }
      if (message.id !== latest.current) return;
      if (message.type === "error") {
        setState((s) => ({ ...s, error: message.message }));
        return;
      }
      try {
        const runtime = await loadRuntime(message.framework);
        if (message.id !== latest.current) return;
        const exported = runModules(message.files, runtime);
        setState({ status: "ready", files: message.files, result: { runtime, exported }, error: null });
      } catch (error) {
        setState((s) => ({
          ...s,
          files: message.files,
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    });
    instance.addEventListener("error", (event) => {
      setState((s) => ({
        ...s,
        error: `The compiler did not start: ${event.message || "the worker failed to load"}.`,
      }));
    });

    return () => {
      instance.terminate();
      worker.current = null;
    };
  }, []);

  const compile = useCallback(
    (framework: FrameworkId, files: PlaygroundFile[], options: TransformOptions) => {
      const request: WorkerRequest = { id: ++latest.current, framework, files, options };
      worker.current?.postMessage(request);
    },
    [],
  );

  return [state, compile];
}
