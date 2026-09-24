"use client";

import { css, keyframes } from "next-yak";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { container, fonts, shadow, light, dark, ink } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/mixins";
import { EditorSwitcher } from "@/components/editor-switcher";
import { CopyButton } from "./copy-button";
import { asset } from "@/lib/site";
import { frameworks, FRAMEWORK_TABS } from "./frameworks";
import { Dot, EditorDots } from "./editor-dots";

const blink = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
`;

/**
 * The mascot and the terminal overlap the card with negative margins but stay in flow, so the
 * wrapper's height includes them.
 */
export default function HeroEditorView({
  codeByTab,
  className,
  style,
}: {
  codeByTab: Record<string, string>;
  className?: string;
  style?: CSSProperties;
}) {
  const [active, setActive] = useState<string>(frameworks[0].id);

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
            <EditorDots />
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
            items={FRAMEWORK_TABS}
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
