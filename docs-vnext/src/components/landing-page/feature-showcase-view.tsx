"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { container, fonts, fontSize, ink, light, dark } from "@/tokens";
import { subsectionHeading, editorSurface, codeReset } from "@/lib/mixins";
import { EditorSwitcher } from "@/components/editor-switcher";
import { EditorDots } from "./editor-dots";
import { tourTimeline, tourWindow, tourPointerOverride } from "@/lib/scroll-tour";
import { frameworks, FRAMEWORK_TABS } from "./frameworks";

export type Callout = {
  title: string;
  description: string;
  side: "left" | "right";
  /** 1-based code lines the card annotates. */
  line: number;
  span: number;
  snippetHtml: string;
};

const CODE_FONT_SIZE = "13px";
const CODE_LINE_HEIGHT = 1.7;

/** Title bar and code padding rows before the first code line. */
const ROWS_BEFORE_CODE = 2;

/**
 * Hand-drawn arrows pointing left, one per callout. Left-side callouts (0, 2, 4) render
 * mirrored. The viewBox starts at the ink, so the tip lands where the CSS puts it.
 */
const ARROWS = [
  { shaft: "M58 10C45 8 24 11 9 20", head: "M9 20L21 19M9 20L13 11" },
  { shaft: "M50 26C42 27 24 24 14 11", head: "M14 11L25 13M14 11L16 21" },
  { shaft: "M61 23C50 28 44 8 30 13C21 16 15 20 8 15", head: "M8 15L19 12M8 15L17 21" },
  { shaft: "M57 12C48 5 42 19 32 15C24 12 18 15 10 22", head: "M10 22L22 20M10 22L14 12" },
  { shaft: "M48 4C40 7 22 12 13 25", head: "M13 25L24 22M13 25L16 15" },
  { shaft: "M59 24C46 29 24 25 9 13", head: "M9 13L21 12M9 13L16 21" },
] as const;

/**
 * Wide layouts use one grid whose rows mirror the editor (title bar, padding, one row per
 * code line, padding), so a card on `grid-row: line + 2 / span n` lands level with its
 * lines. Narrow layouts hide the editor and each card shows its own slice of the code.
 */
export default function FeatureShowcaseView({
  codeByTab,
  lineCount,
  codeCols,
  callouts,
  className,
  style,
}: {
  codeByTab: Record<string, string>;
  lineCount: number;
  /** Widest card snippet line, in characters. */
  codeCols: number;
  callouts: readonly Callout[];
  className?: string;
  style?: CSSProperties;
}) {
  const [active, setActive] = useState<string>(frameworks[0].id);
  const [hovered, setHovered] = useState<number | null>(null);

  const placement = (c: Callout, i: number) =>
    ({ "--row": c.line + ROWS_BEFORE_CODE, "--span": c.span, "--i": i }) as CSSProperties;

  // a touch tap would latch a callout with no way to leave it
  const enter = (i: number) => (event: PointerEvent) => {
    if (event.pointerType !== "touch") setHovered(i);
  };

  return (
    <Grid
      className={className}
      data-tour-hover={hovered !== null || undefined}
      style={
        {
          ...style,
          "--lines": lineCount,
          "--code-cols": codeCols,
          "--n": callouts.length,
        } as CSSProperties
      }
    >
      <Editor>
        <TitleBar>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 16px;
            `}
          >
            <EditorDots />
            <span
              css={css`
                color: ${ink.fgMuted};
                font-family: ${fonts.mono};
                font-size: 13px;
              `}
            >
              Button.tsx
            </span>
          </div>
          <EditorSwitcher
            value={active}
            onValueChange={setActive}
            items={FRAMEWORK_TABS}
            ariaLabel="Framework"
          />
        </TitleBar>
        <CodeArea dangerouslySetInnerHTML={{ __html: codeByTab[active] }} />
      </Editor>

      {callouts.map((callout, i) => (
        <Card
          key={callout.title}
          data-side={callout.side}
          data-active={hovered === i || undefined}
          onPointerEnter={enter(i)}
          onPointerLeave={() => setHovered(null)}
          style={placement(callout, i)}
        >
          <Arrow aria-hidden viewBox="6 0 60 40" fill="none">
            <path
              d={ARROWS[i % ARROWS.length].shaft}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d={ARROWS[i % ARROWS.length].head}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Arrow>
          <CardBody>
            <CardText>
              <CardTitle>{callout.title}</CardTitle>
              <p
                css={css`
                  margin-top: var(--desc-gap, 6px);
                  font-size: var(--desc-size, ${fontSize.small});
                  line-height: var(--desc-lh, 1.5);
                `}
              >
                {callout.description}
              </p>
            </CardText>
            <CardCode>
              <CardCodeBox dangerouslySetInnerHTML={{ __html: callout.snippetHtml }} />
            </CardCode>
          </CardBody>
        </Card>
      ))}

      {callouts.map((callout, i) => (
        <LineHighlight
          key={callout.title}
          aria-hidden
          data-active={hovered === i || undefined}
          style={placement(callout, i)}
        />
      ))}
    </Grid>
  );
}

const bandReveal = keyframes`
  0%,
  100% {
    opacity: 0;
  }
  20%,
  80% {
    opacity: 1;
  }
`;

const markerSweep = keyframes`
  0% {
    background-size: 0% 60%;
  }
  22%,
  86% {
    background-size: 100% 60%;
  }
  100% {
    background-size: 0% 60%;
  }
`;

/* an unregistered custom property animates discretely */
const leaderAccent = keyframes`
  0%,
  100% {
    --leader: var(--leader-off);
  }
  10%,
  90% {
    --leader: var(--leader-on);
  }
`;

const Grid = styled.div`
  --editor-head: 48px;
  --code-pad: 12px;
  --line-h: calc(${CODE_FONT_SIZE} * ${CODE_LINE_HEIGHT});

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  padding-top: clamp(8px, 2vw, 24px);

  @container section (min-width: ${container.section.twoCol}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  @container section (min-width: ${container.section.annotateOne}) {
    /* annotateOne breakpoint = 400 + 360 + column gap. Stepped, not cqi: the arrow reads
       --col-gap inside a card, which is its own container. */
    --col-gap: 44px;
    grid-template-columns: minmax(400px, 480px) 360px;
    grid-template-rows:
      var(--editor-head) var(--code-pad) repeat(var(--lines), var(--line-h))
      var(--code-pad);
    justify-content: center;
    column-gap: var(--col-gap);
    row-gap: 0;

    ${tourTimeline};
  }

  @container section (min-width: 1000px) {
    --col-gap: 52px;
  }

  @container section (min-width: 1200px) {
    --col-gap: 64px;
  }

  @container section (min-width: ${container.section.annotate}) {
    /* annotate breakpoint = 400 + 2 * 250 + column gaps */
    grid-template-columns: minmax(250px, 300px) minmax(400px, 480px) minmax(250px, 300px);
  }
`;

const Editor = styled.div`
  ${editorSurface};
  container: editor / inline-size;
  display: none;
  flex-direction: column;

  @container section (min-width: ${container.section.annotateOne}) {
    display: flex;
    grid-column: 1;
    grid-row: 1 / -1;
  }

  @container section (min-width: ${container.section.annotate}) {
    grid-column: 2;
  }
`;

const TitleBar = styled.div`
  box-sizing: border-box;
  height: var(--editor-head);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 2px solid ${ink.divider};
`;

const CodeArea = styled.div`
  padding: var(--code-pad);
  overflow: hidden;

  ${codeReset};
  pre {
    font-size: ${CODE_FONT_SIZE};
    line-height: ${CODE_LINE_HEIGHT};
  }
`;

const LineHighlight = styled.div`
  display: none;
  pointer-events: none;

  @container section (min-width: ${container.section.annotateOne}) {
    display: block;
    grid-column: 1;
    grid-row: var(--row) / span var(--span);
    margin-inline: 4px;
    border-radius: 6px;
    background: ${ink.hover};
    opacity: 0;

    @media (prefers-reduced-motion: no-preference) {
      transition: opacity 0.15s ease;
    }

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${bandReveal} linear both;
        ${tourWindow};
      }
    }

    ${tourPointerOverride};

    &[data-active] {
      opacity: 1;
    }
  }

  @container section (min-width: ${container.section.annotate}) {
    grid-column: 2;
  }
`;

const Card = styled.div`
  --leader-off: light-dark(${light.beige6}, ${dark.navy6});
  --leader-on: light-dark(${light.red}, ${dark.red});
  --leader: var(--leader-off);
  background: light-dark(${light.beige1}, ${dark.navy1});
  border: 1px solid light-dark(${light.beige5}, ${dark.navy5});
  border-radius: 16px;
  /* an element cannot query its own container, so CardBody switches the layout */
  container: card / inline-size;
  padding: 20px 22px;

  @container section (min-width: ${container.section.annotateOne}) {
    position: relative;
    grid-column: 2;
    grid-row: var(--row) / span var(--span);
    align-self: center;
    background: none;
    border: none;
    box-shadow: none;
    padding: 6px 10px;
    --desc-gap: 2px;
    --desc-size: 13px;
    --desc-lh: 18px;

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${leaderAccent} linear both;
        ${tourWindow};
      }
    }

    ${tourPointerOverride};

    &[data-active] {
      --leader: var(--leader-on);
    }
  }

  @container section (min-width: ${container.section.annotate}) {
    padding: 8px 12px;
    --desc-gap: 6px;
    --desc-size: ${fontSize.small};
    --desc-lh: 1.5;

    &[data-side="left"] {
      grid-column: 1;
      text-align: right;
    }

    &[data-side="right"] {
      grid-column: 3;
    }
  }
`;

const Arrow = styled.svg`
  display: none;

  @container section (min-width: ${container.section.annotateOne}) {
    display: block;
    position: absolute;
    top: 50%;
    right: calc(100% + 5px);
    width: calc(var(--col-gap) - 10px);
    height: calc((var(--col-gap) - 10px) * 40 / 60);
    transform: translateY(-50%);
    color: var(--leader);
    pointer-events: none;

    @media (prefers-reduced-motion: no-preference) {
      transition: color 0.18s ease;
    }
  }

  @container section (min-width: ${container.section.annotate}) {
    ${Card}[data-side="left"] & {
      left: calc(100% + 5px);
      right: auto;
      transform: translateY(-50%) scaleX(-1);
    }
  }
`;

const CardTitle = styled.h3`
  ${subsectionHeading};
  line-height: 22px;

  @container section (min-width: ${container.section.annotateOne}) {
    /* so the marker stroke covers the words, not the column */
    display: inline-block;
    --marker: light-dark(
      color-mix(in oklch, ${light.red} 24%, transparent),
      color-mix(in oklch, ${dark.red} 30%, transparent)
    );
    background-image: linear-gradient(to right, var(--marker), var(--marker));
    background-repeat: no-repeat;
    background-position: 0 82%;
    background-size: 0% 60%;
    border-radius: 0.7em 0.25em 0.6em 0.3em;
    padding-inline: 0.2em;
    margin-inline: -0.2em;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;

    @media (prefers-reduced-motion: no-preference) {
      transition: background-size 0.22s ease;
    }

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${markerSweep} linear both;
        ${tourWindow};
      }
    }

    ${tourPointerOverride};

    ${Card}[data-active] & {
      background-size: 100% 60%;
    }
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;

  @container card (min-width: ${container.card.row}) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;

const CardText = styled.div`
  @container card (min-width: ${container.card.row}) {
    flex: 1 1 0;
    min-width: 0;
  }
`;

const CardCode = styled.div`
  padding-top: 14px;
  /* mono metrics so the \`ch\` width matches the code. One width for every card. */
  font-family: ${fonts.mono};
  font-size: ${CODE_FONT_SIZE};
  --code-w: calc((var(--code-cols) + 0.5) * 1ch + 24px);

  @container card (min-width: ${container.card.row}) {
    flex: 0 0 var(--code-w);
    padding-top: 0;
  }

  @container section (min-width: ${container.section.annotateOne}) {
    display: none;
  }
`;

const CardCodeBox = styled.div`
  box-sizing: border-box;
  width: var(--code-w);
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${ink.card};

  ${codeReset};
  pre {
    line-height: 1.6;
  }
`;
