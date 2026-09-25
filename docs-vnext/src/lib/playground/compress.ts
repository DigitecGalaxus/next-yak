import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";

/**
 * The dictionary is part of the share link format and is frozen for version "0".
 * Changing any entry breaks every existing link.
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
  // snippets and files of the old playground's default example
  `const Center = styled.div\`
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
`,
  `import { styled } from "next-yak";

export const theme = {
  dark: "html.dark &",
  light: "html.light &",
};

export const Title = styled.h1\`
  font-size: 5rem;
  font-weight: 400;
  text-align: center;
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;

  background: #000;
  background: radial-gradient(
    circle farthest-corner at top left,
    #000 0%,
    #333 100%
  );
  -webkit-text-fill-color: transparent;

  @supports (-webkit-text-stroke: red 1px) {
    transform: translateY(-4px);
    padding: 4px 0;
    \${theme.dark} {
      background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;
      -webkit-background-clip: text;
      background-clip: text;
    }
    background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;
    -webkit-text-fill-color: initial;
    -webkit-text-stroke: 4px transparent;
    -webkit-background-clip: text;
    background-clip: text;
    color: var(--color-fd-background);
    letter-spacing: 0.02em;
  }

  background-clip: text;
  -webkit-background-clip: text;
\`;`,
  `const green = "00ff00";
export const myColor = \`#\${ green }\`;`,
]
  // longest first, so `import { styled, css } from "next-yak";` wins over `import`
  .sort((a, b) => b.length - a.length);

const DELIMITER = convertDictionaryIndexToToken(0);

// the delimiter must be token 0
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
  return fromUint8Array(compressSync(strToU8(compressed), { level: 9, mem: 12 }));
};

export const decompressWithDictionary = (compressed: string): Record<string, string> => {
  let expanded = strFromU8(decompressSync(toUint8Array(compressed)));
  dictionary.forEach((token, index) => {
    expanded = expanded.replaceAll(convertDictionaryIndexToToken(index), token);
  });
  const [version, ...code] = expanded.split(DELIMITER);
  if (version !== DICTIONARY_VERSION) {
    throw new Error(`Unsupported dictionary version: ${version}`);
  }
  const result: Record<string, string> = {};
  for (let i = 0; i < code.length; i += 2) {
    result[code[i]] = code[i + 1];
  }
  return result;
};
