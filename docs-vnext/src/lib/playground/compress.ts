import { LEGACY_EXAMPLE_FILES } from "./legacy-example";
import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";

/**
 * Share links carry the playground files in `?q=`: the files joined with a delimiter,
 * common snippets swapped for 2-byte tokens, then deflated and base64 encoded.
 *
 * The dictionary is part of the link format. Change one entry and every link made before
 * the change decodes to the wrong text. So version "0" is frozen, including the two files
 * of the old default example (see legacy-example.ts). A new dictionary needs a new version
 * and a decoder that keeps the old one.
 */
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
  // The files of the old default example, so a link that edits only the main file stays short
  `const Center = styled.div\`
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
`,
  LEGACY_EXAMPLE_FILES.other,
  LEGACY_EXAMPLE_FILES["different.yak"],
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

export const compressWithDictionary = (code: Record<string, string>): string => {
  let compressed =
    DICTIONARY_VERSION +
    DELIMITER +
    Object.entries(code)
      .flatMap(([path, content]) => [path, content])
      .join(DELIMITER);
  dictionary.forEach((token, index) => {
    compressed = compressed.replaceAll(token, convertDictionaryIndexToToken(index));
  });
  const compressedBytes = strToU8(compressed);
  const compressedFlate = compressSync(compressedBytes, { level: 9, mem: 12 });
  return fromUint8Array(compressedFlate);
};

export const decompressWithDictionary = (compressed: string): Record<string, string> => {
  const decompressed = strFromU8(decompressSync(toUint8Array(compressed)));
  let expanded = decompressed;
  dictionary.forEach((token, index) => {
    expanded = expanded.replaceAll(convertDictionaryIndexToToken(index), token);
  });
  const [version, ...code] = expanded.split(DELIMITER);
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
