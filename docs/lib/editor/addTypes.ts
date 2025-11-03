import reactDts from "../../node_modules/@types/react/index.d.ts?raw";
import reactJSXDts from "../../node_modules/@types/react/jsx-runtime.d.ts?raw";
import yakDts from "../../node_modules/next-yak/dist/index.d.ts?raw";
import yakJSXDts from "../../node_modules/next-yak/dist/jsx-runtime.d.ts?raw";
import type { Monaco } from "@monaco-editor/react";

export const addTypesToMonaco = (monaco: Monaco) => {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    yakDts,
    "file:///node_modules/next-yak/index.d.ts",
  );

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    yakJSXDts,
    "file:///node_modules/next-yak/jsx-runtime.d.ts",
  );

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactDts,
    "file:///node_modules/@types/react/index.d.ts",
  );

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactJSXDts,
    "file:///node_modules/@types/react/jsx-runtime.d.ts",
  );
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
};
