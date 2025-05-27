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
};

type TranspileResult = {
  renderedMainComponent: {
    component: ReactNode | null;
    error: string | null;
  };
  transpiledMainFile?: TranspiledFile;
  transpiledAdditionalFiles?: TranspiledFile[];
};

export const useTranspile = (
  initialProps?: TranspileInput,
): [TranspileResult | null, (props: TranspileInput) => void] => {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<TranspileResult | null>(null);

  const allFilenames = [
    initialProps?.mainFile.name,
    ...(initialProps?.additionalFiles?.map((file) => file.name) ?? []),
  ];

  const workerOnMessage = useCallback(
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

        setResult({
          renderedMainComponent: {
            component: result.comp,
            error: null,
          },
          transpiledMainFile: {
            name: initialProps?.mainFile.name ?? "index",
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
        });
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
    workerRef.current?.postMessage(props);
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/transpileWorker", import.meta.url),
    );
    worker.onmessage = (event) => {
      if (event.data === "workerReady") {
        if (initialProps) {
          transpile(initialProps); // Transpile after worker is ready
        }
      } else {
        workerOnMessage(event);
      }
    };
    workerRef.current = worker;
    if (initialProps) {
      transpile(initialProps);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return [result, transpile];
};
