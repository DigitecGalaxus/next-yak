import { examples } from "@/app/(home)/playground/examples";
import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";
import { decompressFromEncodedURIComponent } from "lz-string";

const DICTIONARY_VERSION = "0";

const convertDictionaryIndexToToken = (n: number) => {
  if (n > 64) {
    throw new Error("Token number exceeds limit of 64");
  }
  return "\x00" + String.fromCharCode(97 + n);
};

const dictionary = [
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
  "@media",
  "@container",
  "&::before {",
  'content: ""',
  "color",
  "transparent",
  "-webkit-",
  "linear-gradient(",
  "gradient(",
  "border:",
  "transform:",
  "translate",
  "padding",
  "text-align:",
  "font-size:",
  "font-weight:",
  "border-radius:",
  "position:",
  "transition:",
  "cursor: pointer",
  "animation:",
  // JS
  "function ",
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
  "Component()",
  "different.yak",
  "other",
  "index",
  "/img/yak-jumping.png",
  // For the case that you change only the main file
  // This is kind of dangerous as the dictionary points
  // always to the latest version of example
  `const Center = styled.div\`
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
`,
  examples.base.files.other,
  examples.base.files["different.yak"],
]
  // Sorting the dictionary by length in descending order
  // to ensure that longer tokens are replaced first
  // e.g. `import { styled, css } from "next-yak";` before `import`
  .sort((a, b) => b.length - a.length);

// The delimiter is a special token that is used to separate
// the different parts of the compressed string
const DELIMITER = convertDictionaryIndexToToken(0);

// It is important that the DELIMITER is the first token in the dictionary,
// so that the index 0 matches the value
dictionary.unshift(DELIMITER);

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
