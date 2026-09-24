import type { DecorationItem, ShikiTransformer } from "shiki";

/**
 * `⟦1:styled.div⟧` in a code fence marks "styled.div" with link key 1. The markers are
 * removed and each marked part is wrapped in a span with `data-link="1"`. Keys are 1 to 6,
 * one colour each in <SideBySide>. A part that spans lines gets one span per line, starting
 * after the indentation.
 *
 * source.config.ts imports this file outside Next, so it must not import next-yak or next/font.
 */
const MARKER = /⟦([1-6]):([^⟧]*)⟧/g;

export function transformerCodeLinks(): ShikiTransformer {
  return {
    name: "yak:code-links",
    enforce: "pre",
    preprocess(code, options) {
      if (!code.includes("⟦")) return;

      const decorations: DecorationItem[] = [];
      let removed = 0;
      const clean = code.replace(MARKER, (match, key: string, text: string, offset: number) => {
        let start = offset - removed;
        removed += match.length - text.length;
        for (const [index, line] of text.split("\n").entries()) {
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
