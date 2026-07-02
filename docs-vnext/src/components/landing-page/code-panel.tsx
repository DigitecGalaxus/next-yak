import { css } from "next-yak";
import type { CSSProperties } from "react";
import { highlighterPromise, yakTheme } from "@/lib/shiki";
import { colors, fonts } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";

type Block = { code: string; lang: string };

export default async function CodePanel({
  title,
  blocks,
  className,
  style,
}: {
  title: string;
  blocks: Block[];
  className?: string;
  style?: CSSProperties;
}) {
  const highlighter = await highlighterPromise;
  const rendered = blocks.map((block) =>
    highlighter.codeToHtml(block.code, { lang: block.lang, theme: yakTheme.name }),
  );

  return (
    <figure
      className={className}
      style={style}
      css={css`
        ${editorSurface};
        display: flex;
        flex-direction: column;
        height: 100%;
      `}
    >
      <figcaption
        css={css`
          padding: 10px 12px;
          font-family: ${fonts.mono};
          color: ${colors.onInkMuted};
          border-bottom: 2px solid ${colors.onInkDivider};
          font-size: 13px;
        `}
      >
        {title}
      </figcaption>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 18px 20px;

          ${codeReset};
          pre {
            font-size: 13px;
            line-height: 1.7;
          }
        `}
      >
        {rendered.map((html, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </div>
    </figure>
  );
}
