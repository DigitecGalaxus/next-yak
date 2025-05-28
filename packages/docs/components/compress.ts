import { fromUint8Array, toUint8Array } from "js-base64";
import { strToU8, strFromU8, compressSync, decompressSync } from "fflate";
import { decompressFromEncodedURIComponent } from "lz-string";

const DICTIONARY_VERSION = "0";

const convertDictionaryIndexToToken = (n: number) => {
  if (n > 64) {
    throw new Error("Token number exceeds limit of 64");
  }
  return "\x00" + String.fromCharCode(97 + n);
};

const DELIMITER = convertDictionaryIndexToToken(0);

const dictionary = [
  // Delimiter to separate code parts
  DELIMITER,
  // Common Imports (next-yak and react)
  `import { styled, css } from "next-yak";`,
  `import { styled } from "next-yak";`,
  `import { css } from "next-yak";`,
  `} from "next-yak";`,
  " from 'react';",
  // Imports
  `import { `,
  `import `,
  ` } from "`,
  // Exports
  `export default `,
  `export const `,
  // Next-yak
  "css={css`",
  ` = styled.`,
  ` = styled(`,
  "div`\n",
  "button`\n",
  // CSS
  "background",
  "height:",
  "width:",
  "display: grid",
  "display: flex",
  "display: block",
  "display: inline-block",
  "display: none",
  "@supports (",
  "&::before {",
  'content: ""',
  "color",
  "transparent",
  "-webkit-",
  "linear-gradient(",
  "gradient(",
  "border: ",
  "transform:",
  "translate",
  "padding",
  "font-size",
  "font-weight",
  "border-radius",
  "position: ",
  "transition: ",
  "cursor: pointer",
  // JS
  "function ",
  "Component",
  "\n  return ",
  "return ",
  "const ",
  " }) =>",
  // React
  "useEffect",
  "useState",
  "useRef",
  "useCallback",
  "useMemo",
  // Demo Constants
  "different.yak",
  "other",
  "index",
  "/img/yak-jumping.png",
] as const;

export const compressWithDictionary = (
  code: Record<string, string>,
): string => {
  let compressed =
    DICTIONARY_VERSION +
    DELIMITER +
    Object.entries(code)
      .flatMap(([path, content]) => [path, content])
      .join(DELIMITER);
  dictionary.forEach((token, index) => {
    compressed = compressed.replaceAll(
      token,
      convertDictionaryIndexToToken(index),
    );
  });
  const compressedBytes = strToU8(compressed);
  const compressedFlate = compressSync(compressedBytes, { level: 9, mem: 12 });
  // Log into console for the curious users
  console.log(
    "Compressed from ",
    Object.entries(code).reduce(
      (acc, [path, content]) => acc + path.length + content.length,
      0,
    ),
    "b to ",
    fromUint8Array(compressedFlate).length,
    "b",
  );
  return fromUint8Array(compressedFlate);
};

export const decompressWithDictionary = (
  compressed: string,
): Record<string, string> => {
  let decompressed = "";
  try {
    decompressed = strFromU8(decompressSync(toUint8Array(compressed)));
  } catch {}
  if (!decompressed) {
    // Backwards compatibility for old versions with JSON parsing
    // Feel free to remove after August 2025
    decompressed = decompressFromEncodedURIComponent(compressed);
    if (decompressed.startsWith("{")) {
      return JSON.parse(decompressed) as Record<string, string>;
    }
    throw new Error("Decompression failed");
  }
  dictionary.forEach((token, index) => {
    decompressed = decompressed.replaceAll(
      convertDictionaryIndexToToken(index),
      token,
    );
  });
  const [version, ...code] = decompressed.split(DELIMITER);
  if (version !== DICTIONARY_VERSION) {
    throw new Error(`Unsupported dictionary version: ${version}`);
  }
  const result: Record<string, string> = {};
  for (let i = 0; i < code.length; i += 2) {
    const path = code[i];
    const content = code[i + 1];
    result[path] = content;
  }
  return result;
};
