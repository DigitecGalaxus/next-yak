"use client";

import { css, keyframes } from "next-yak";
import Image from "next/image";
import { ReactNode, useState, type CSSProperties } from "react";
import { container, fonts, shadow, light, dark, ink } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { EditorSwitcher } from "@/components/editor-switcher";
import { CopyButton } from "./copy-button";
import { asset } from "@/lib/site";
import { frameworks } from "./frameworks";

const blink = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
`;

function Dot({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
    </svg>
  );
}

/**
 * Interactive shell for the hero code editor. Highlighting happens on the server
 * (see hero-editor.tsx); this client component just tracks which framework tab is
 * active and swaps in the matching pre-highlighted code, install command, and the
 * import line. The pills show when the editor is wide enough; a compact <select>
 * dropdown takes over on narrow editors.
 *
 * Layout: the mascot and the npm terminal are normal flow children that overlap the
 * card with negative margins, so the wrapper's height naturally includes them — the
 * surrounding page never has to reserve space for these "peek-out" decorations. The
 * wrapper is the query container, so the mascot scales (cqi) and the switcher flips
 * with the *editor's own* width.
 */
export default function HeroEditorView({
  tabs,
  codeByTab,
  className,
  style,
}: {
  tabs: readonly { value: string; node: ReactNode }[];
  codeByTab: Record<string, string>;
  className?: string;
  style?: CSSProperties;
}) {
  const [active, setActive] = useState(tabs[0].value);

  return (
    <div
      className={className}
      style={style}
      css={css`
        container: editor / inline-size;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        max-width: 620px;

        /* in the side-by-side layout the editor shares the row with the text column:
           it shrinks with the available space but never below 400px — the width we
           already ship on mobile — so the layout can go side-by-side that early */
        @container hero (min-width: ${container.hero.split}) {
          flex: 0 1 620px;
          min-width: 400px;
        }
      `}
    >
      <Image
        src={asset("/yak-hero.png")}
        alt="Yak hero"
        width="1248"
        height="832"
        css={css`
          position: relative;
          z-index: 1;
          align-self: flex-start;
          margin-left: clamp(124px, 24cqi, 168px);
          margin-bottom: clamp(-28px, -4.5cqi, -18px);
          width: clamp(104px, 26cqi, 160px);
          height: auto;
          aspect-ratio: 3/2;
        `}
      />

      {/* the visible editor card — the canonical code-surface chrome (hairline + soft
          shadow + ink fill), shared with docs code blocks via lib/editor-surface */}
      <div
        data-ink
        css={css`
          ${editorSurface};
          display: flex;
          flex-direction: column;
          align-items: stretch;
        `}
      >
        <div
          css={css`
            display: flex;
            padding: 8px 12px;
            justify-content: space-between;
            align-items: center;
            align-self: stretch;
            border-bottom: 2px solid ${ink.divider};
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 16px;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-shrink: 0;
                align-items: center;
                gap: 7px;
              `}
            >
              <Dot color={ink.dotRed} />
              <Dot color={ink.dotYellow} />
              <Dot color={ink.dotGreen} />
            </div>
            <div
              css={css`
                color: ${ink.fgMuted};
                font-family: ${fonts.mono};
                font-size: 13px;
              `}
            >
              Button.tsx
            </div>
          </div>

          <EditorSwitcher
            value={active}
            onValueChange={setActive}
            items={tabs}
            ariaLabel="Framework"
          />
        </div>

        <div
          css={css`
            align-self: stretch;
            overflow: hidden;
            padding: 12px;

            ${codeReset};
            pre {
              font-size: 13px;
              line-height: 1.7;
            }
          `}
          dangerouslySetInnerHTML={{ __html: codeByTab[active] }}
        />
      </div>

      <Terminal packageName={frameworks.find((f) => f.id === active)?.pkg} />
    </div>
  );
}

function Terminal({ packageName }: { packageName?: string }) {
  return (
    <div
      data-ink
      css={css`
        align-self: flex-end;
        margin-top: -44px;
        margin-right: -12px;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transform: rotate(2deg);
        min-width: 300px;
        padding: 12px 14px 14px;
        border: 1px solid ${ink.border};
        border-radius: 12px;
        background: ${ink.terminal};
        box-shadow: ${shadow.popover};
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 8px;
        `}
      >
        <Dot color={ink.dotRed} />
        <Dot color={ink.dotYellow} />
        <Dot color={ink.dotGreen} />
      </div>

      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: ${fonts.mono};
          font-size: 14px;
          font-weight: 500;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${ink.prompt};
          `}
        >
          <span
            aria-hidden
            css={css`
              font-weight: 700;
              user-select: none;
              -webkit-user-select: none;
            `}
          >
            $
          </span>
          <span
            css={css`
              color: white;
            `}
          >
            npm i
          </span>
          <span
            css={css`
              color: light-dark(${light.red}, ${dark.red});
              font-weight: 700;
            `}
          >
            {packageName}
          </span>
          <span
            css={css`
              display: inline-block;
              width: 8px;
              height: 16px;
              background: ${ink.prompt};
              animation: ${blink} 1s step-end infinite;
            `}
          />
        </div>
        <CopyButton
          text={`npm i ${packageName}`}
          css={css`
            align-self: end;
          `}
        />
      </div>
    </div>
  );
}
