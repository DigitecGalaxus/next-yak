import type { DecorationItem, ShikiTransformer } from "shiki";

/**
 * Linked parts across two code blocks, for input/output pairs (see mdx/sideBySide.tsx).
 *
 * In a code fence, `⟦1:styled.div⟧` marks "styled.div" with link key 1. This transformer
 * removes the markers before highlighting and wraps each marked part in a span with
 * `data-link="1"`. Hovering a part lights up every part with the same key in the pair, so
 * a reader can see which output came from which input.
 *
 * The brackets are U+27E6 and U+27E7. They never appear in real code, so a marker cannot
 * clash with an array, a template or JSX. Keys are the digits 1 to 6: SideBySide has one
 * CSS rule and one colour for each key.
 *
 * A marked part may span lines, for example a whole `${(props) => … css`…`}` interpolation.
 * Each line then gets its own span that starts after the indentation, so the highlight
 * follows the code and does not fill the empty space at the left.
 *
 * Kept free of `next/font`, `var(--…)` and next-yak, because source.config.ts imports it.
 */
const MARKER = /⟦([1-6]):([^⟧]*)⟧/g;

export function transformerCodeLinks(): ShikiTransformer {
  return {
    name: "yak:code-links",
    // before the other transformers, so they all see the code without markers
    enforce: "pre",
    preprocess(code, options) {
      if (!code.includes("⟦")) return;

      const decorations: DecorationItem[] = [];
      let removed = 0;
      const clean = code.replace(MARKER, (match, key: string, text: string, offset: number) => {
        let start = offset - removed;
        removed += match.length - text.length;
        for (const [index, line] of text.split("\n").entries()) {
          // continuation lines start after their indentation
          const indent = index === 0 ? 0 : line.length - line.trimStart().length;
          if (line.length > indent) {
            decorations.push({
              start: start + indent,
              end: start + line.length,
              properties: { "data-link": key },
            });
          }
          start += line.length + 1;
        }
        return text;
      });

      options.decorations = [...(options.decorations ?? []), ...decorations];
      return clean;
    },
  };
}
