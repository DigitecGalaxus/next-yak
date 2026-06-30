"use client";

import { css, keyframes } from "next-yak";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { colors, container, fonts, shadow } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { EditorSwitcher } from "@/components/editor-switcher";
import { CopyButton } from "./copy-button";
import { asset } from "@/lib/site";

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
  tabs: readonly string[];
  codeByTab: Record<string, string>;
  className?: string;
  style?: CSSProperties;
}) {
  const [active, setActive] = useState(tabs[0]);

  const installCommand = `npm i ${active}`;

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
      {/* mascot: in flow, peeking over the card's top edge. It grows with the editor
          (cqi) and the negative margin lets the card ride up over its base. */}
      <Image
        src={asset("/yak-hero.png")}
        alt="Yak hero"
        width="1248"
        height="832"
        css={css`
          position: relative;
          z-index: 1;
          /* tuck into the empty title-bar space, left of the switcher (offset from the
             left so it clears the filename; scales a little so it sits center-left on a
             narrow editor and further into the gap on a wide one) */
          align-self: flex-start;
          margin-left: clamp(124px, 24cqi, 168px);
          /* drop it down so the yak's hooves rest on / overlap the editor's top edge;
             scales with the mascot so the overlap stays consistent across sizes */
          margin-bottom: clamp(-28px, -4.5cqi, -18px);
          width: clamp(104px, 26cqi, 160px);
          height: auto;
          aspect-ratio: 3/2;
        `}
      />

      {/* the visible editor card — the canonical code-surface chrome (hairline + soft
          shadow + ink fill), shared with docs code blocks via lib/editor-surface */}
      <div
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
            border-bottom: 2px solid ${colors.onInkDivider};
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
              <Dot color="#F2462E" />
              <Dot color="#FFCE4A" />
              <Dot color="#00C2A8" />
            </div>
            <div
              css={css`
                color: ${colors.onInkMuted};
                font-family: ${fonts.mono};
                font-size: 10px;
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
              font-size: 11px;
              line-height: 1.7;
            }
          `}
          dangerouslySetInnerHTML={{ __html: codeByTab[active] }}
        />
      </div>

      {/* npm install terminal: in flow, riding up over the card's bottom-right corner
          (negative top-margin) and peeking past the right edge a touch. Because it's in
          flow, the wrapper's height already accounts for the part that hangs below. */}
      <div
        css={css`
          align-self: flex-end;
          margin-top: -44px;
          margin-right: -12px;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transform: rotate(2deg);
          min-width: 260px;
          max-width: 100%;
          padding: 12px 14px 14px;
          border: 1px solid light-dark(rgba(14, 235, 241, 0.35), rgba(14, 235, 241, 0.16));
          border-radius: 12px;
          background: ${colors.editorPopup};
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
          <Dot color="#F2462E" />
          <Dot color="#FFCE4A" />
          <Dot color="#00C2A8" />
        </div>

        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: ${fonts.mono};
            font-size: 14px;
            font-weight: 500;
            align-self: stretch;
          `}
        >
          <span
            aria-hidden
            css={css`
              color: ${colors.cyan};
              font-weight: 700;
              user-select: none;
              -webkit-user-select: none;
            `}
          >
            $
          </span>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
              color: #8b7bbd;
            `}
          >
            <span>npm i</span>
            <span
              css={css`
                color: white;
                font-weight: 700;
              `}
            >
              {active}
            </span>
            <span
              css={css`
                display: inline-block;
                width: 8px;
                height: 16px;
                background: ${colors.cyan};
                animation: ${blink} 1s step-end infinite;
              `}
            />
          </div>
        </div>

        <div
          css={css`
            display: flex;
            justify-content: flex-end;
          `}
        >
          <CopyButton text={installCommand} />
        </div>
      </div>
    </div>
  );
}
