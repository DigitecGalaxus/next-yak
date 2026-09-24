"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { runModules } from "./run-module";
import type {
  PlaygroundFile,
  TransformOptions,
  TransformedFile,
  WorkerRequest,
  WorkerResponse,
} from "./types";

export type CompilerState = {
  status: "loading" | "ready";
  /** the last output that compiled and ran. It stays on screen while the code has an error. */
  files: TransformedFile[];
  Component: ComponentType | null;
  error: string | null;
};

/**
 * Compiles the playground files in a worker and runs the result.
 *
 * Every request carries an id, and only the answer to the newest request counts. A slow
 * compile that finishes after a faster, newer one cannot put old output back on screen.
 */
export function useCompiler(): [CompilerState, (files: PlaygroundFile[], options: TransformOptions) => void] {
  const worker = useRef<Worker | null>(null);
  const latest = useRef(0);
  const [state, setState] = useState<CompilerState>({
    status: "loading",
    files: [],
    Component: null,
    error: null,
  });

  useEffect(() => {
    const instance = new Worker(new URL("./transform-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = instance;

    instance.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
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
        const Component = runModules(message.files);
        setState({ status: "ready", files: message.files, Component, error: null });
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

  const compile = useCallback((files: PlaygroundFile[], options: TransformOptions) => {
    const request: WorkerRequest = { id: ++latest.current, files, options };
    worker.current?.postMessage(request);
  }, []);

  return [state, compile];
}
