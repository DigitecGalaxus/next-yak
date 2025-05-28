"use client";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { executeCode } from "./execute-code";
import * as React from "react";
import * as NextYakInternal from "next-yak/internal";

type File = {
  name: string;
  content: string;
};

type TranspiledFile = {
  name: string;
  transpiledReadableContent: string;
  css: string;
};

export type TranspileInput = {
  mainFile: File;
  additionalFiles?: File[];
  options?: {
    minify?: boolean;
    showComments?: boolean;
  };
};

type TranspileResult = {
  renderedMainComponent: {
    component: ReactNode | null;
    error: string | null;
  };
  transpiledMainFile: TranspiledFile;
  transpiledAdditionalFiles: TranspiledFile[];
};

export const useTranspile = (
  initialProps?: TranspileInput,
): [TranspileResult, (props: TranspileInput) => void] => {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<TranspileResult>({
    renderedMainComponent: {
      component: null,
      error: null,
    },
    transpiledMainFile: {
      name: initialProps?.mainFile.name ?? "index",
      transpiledReadableContent: "",
      css: "",
    },
    transpiledAdditionalFiles: [],
  });
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  const allFilenames = [
    initialProps?.mainFile.name,
    ...(initialProps?.additionalFiles?.map((file) => file.name) ?? []),
  ];

  const workerOnMessagePostInit = useCallback(
    (event: MessageEvent<Parameters<typeof executeCode>[0] | string>) => {
      const eventData = event.data;
      if (typeof eventData === "string") {
        setResult((result) => ({
          ...result,
          renderedMainComponent: {
            component: result?.renderedMainComponent.component ?? null,
            error: eventData,
          },
        }));
        return;
      }

      try {
        const result = executeCode(eventData, {
          react: React,
          "next-yak/internal": NextYakInternal,
          ...allFilenames.reduce(
            (acc, filename) => ({
              ...acc,
              [`./${filename}.yak.css!=!./${filename}?./${filename}.yak.css`]:
                {},
            }),
            {} as any,
          ),
        });

        if (!result) {
          return;
        }

        setResult((r) => ({
          renderedMainComponent: {
            component: result.comp,
            error: null,
          },
          transpiledMainFile: {
            name: r.transpiledMainFile.name,
            transpiledReadableContent: result.transformedCodeToDisplay,
            css: result.css,
          },
          transpiledAdditionalFiles: result.otherFilesTransformed.map(
            ({ name, transformedCodeToDisplay, css }) => ({
              name,
              transpiledReadableContent: transformedCodeToDisplay,
              css,
            }),
          ),
        }));
      } catch (error) {
        setResult((result) => ({
          ...result,
          renderedMainComponent: {
            component: result?.renderedMainComponent.component ?? null,
            error: error instanceof Error ? error.message : String(error),
          },
        }));
      }
    },
    [],
  );

  const transpile = useCallback((props: TranspileInput) => {
    if (workerRef.current) {
      workerRef.current.postMessage(props);
    } else {
      console.error(
        "Attempted to post message to worker before it was created.",
      );
      setResult({
        renderedMainComponent: {
          component: null,
          error: "Worker not initialized.",
        },
        transpiledMainFile: {
          name: props.mainFile.name,
          transpiledReadableContent: "",
          css: "",
        },
        transpiledAdditionalFiles:
          props.additionalFiles?.map((f) => ({
            name: f.name,
            transpiledReadableContent: "",
            css: "",
          })) ?? [],
      });
    }
  }, []);

  const workerOnMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data === "workerReady") {
        setIsWorkerReady(true); // Set state to true
      } else {
        workerOnMessagePostInit(event);
      }
    },
    [workerOnMessagePostInit],
  );

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/transpileWorker", import.meta.url),
    );
    workerRef.current = worker;
    worker.onmessage = workerOnMessage;
    setIsWorkerReady(false);

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      setIsWorkerReady(false);
    };
  }, [workerOnMessage]);

  useEffect(() => {
    if (isWorkerReady && initialProps) {
      transpile(initialProps);
    }
  }, [isWorkerReady, transpile, initialProps]);

  return [result, transpile];
};
