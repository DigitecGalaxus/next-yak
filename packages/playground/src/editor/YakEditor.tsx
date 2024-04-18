import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export const YakEditor = ({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) => {
  const inputEditor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (monaco.editor.getModels().length > 0) {
      return;
    }
    const model = monaco.editor.createModel(
      initialValue,
      "typescript",
      monaco.Uri.parse("file:///input.tsx")
    );
    const editor = monaco.editor.create(inputEditor.current!, {
      value: initialValue,
      language: "typescript",
      theme: "vitesse-dark",
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      overviewRulerLanes: 0,
      scrollbar: {
        vertical: "hidden",
      },
      overviewRulerBorder: false,
      fontSize: 13,
      fontFamily: "Inter",
      lineHeight: 1.5,
      model,
    });
    editor.onDidChangeModelContent(() => {
      onChange(editor.getModel()?.getValue() ?? "");
    });
  }, []);

  return <div ref={inputEditor} style={{ width: "100%", height: "100%" }} />;
};