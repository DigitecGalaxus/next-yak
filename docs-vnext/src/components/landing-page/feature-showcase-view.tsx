"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { container, fonts, fontSize, ink, light, dark } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { subsectionHeading } from "@/lib/mixins";
import { cardStyles } from "./card";
import { EditorSwitcher } from "@/components/editor-switcher";
import { EditorDots } from "./editor-dots";
import { tourTimeline, tourWindow, tourPointerOverride } from "@/lib/scroll-tour";

export type Callout = {
  title: string;
  description: string;
  /** Which side of the editor the card sits on once the layout is wide enough. */
  side: "left" | "right";
  /** 1-based first code line the card annotates. */
  line: number;
  /** How many code lines it covers; the card is centered on that block. */
  span: number;
  /** Pre-highlighted HTML of the lines the card shows on its own when the editor is hidden. */
  snippetHtml: string;
};

const CODE_FONT_SIZE = "13px";
const CODE_LINE_HEIGHT = 1.7;

/** Grid rows in front of the first code line: the title bar and the code padding. */
const ROWS_BEFORE_CODE = 2;

/**
 * One hand-drawn arrow for each callout, drawn pointing left. Six paths, not one mirrored
 * six times: a repeated stroke reads as a stamp, and the point of a drawn arrow is that no
 * two are the same. The viewBox starts at the ink, so the tip lands where the CSS puts it.
 *
 * Judge a change to this set in page order, not in array order. The callouts alternate
 * sides, so the left column shows 0, 2 and 4 mirrored while the right shows 1, 3 and 5 as
 * drawn. Two paths that differ on paper can land as the same stroke once half of them
 * flip. Each one here differs in drift, in curve and in length.
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
 * The "why teams pick it" showcase. Highlighting happens on the server
 * (feature-showcase.tsx); this client half tracks the framework tab and lays things out.
 *
 * Wide sections show the editor with the cards snapped to the code they describe. The
 * trick is one grid whose rows mirror the editor (title bar, padding, one row per code
 * line, padding): the editor spans all rows, so a card on `grid-row: line + 2 / span n`
 * lands level with its lines. From `annotate` the cards sit three a side, from
 * `annotateOne` they queue in one compact column. Scrolling tours the callouts: each has
 * a highlight band on its rows, and a view timeline on the grid (lib/scroll-tour) gives band
 * and card consecutive windows of the scroll range. Pure CSS, progressive enhancement.
 * A mouse or a pen takes the tour over: resting on a card shows that callout's lines for
 * as long as the pointer stays there, whatever the scroll position.
 *
 * Narrower sections drop the editor and each card shows its own slice of the code
 * instead; a card picks stacked or copy-beside-code from its own width.
 */
export default function FeatureShowcaseView({
  title,
  tabs,
  codeByTab,
  lineCount,
  codeCols,
  callouts,
  className,
  style,
}: {
  title: string;
  tabs: readonly { value: string; node: ReactNode }[];
  codeByTab: Record<string, string>;
  lineCount: number;
  /** Widest card snippet line, in characters. */
  codeCols: number;
  callouts: readonly Callout[];
  className?: string;
  style?: CSSProperties;
}) {
  const [active, setActive] = useState(tabs[0].value);
  // the callout the pointer rests on; while it is set, it drives the tour instead of scrolling
  const [hovered, setHovered] = useState<number | null>(null);

  // grid rows of a callout's lines, plus its index in the scroll tour
  const placement = (c: Callout, i: number) =>
    ({ "--row": c.line + ROWS_BEFORE_CODE, "--span": c.span, "--i": i }) as CSSProperties;

  // a touch tap would latch a callout with no way to leave it, so only mouse and pen take over
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
      <Editor data-ink>
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
              {title}
            </span>
          </div>
          <EditorSwitcher
            value={active}
            onValueChange={setActive}
            items={tabs}
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
              <CardCodeBox data-ink dangerouslySetInnerHTML={{ __html: callout.snippetHtml }} />
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

/* fades in over the first fifth of its turn and out over the last fifth */
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

/* the marker stroke sweeps across the title over the first fifth of the turn, holds,
   then draws back out. `background-size` is the only part of a gradient that animates
   smoothly, so the stroke is a gradient and not a border. */
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

/* an unregistered custom property animates discretely: the arrow flips to accent a
   twentieth into the window and back a twentieth before its end */
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
    /* Editor left, one compact card column right. The editor sits between 400px and
       480px: its title bar needs ~460px for the framework pills (the switcher collapses
       to a dropdown below that), and wider than 480px is just empty ink past the longest
       code line. The card column is fixed at 360px so the longest one-line description
       fits without wrapping. The annotateOne breakpoint is 400 + 360 + the column gap. */
    /* Wide enough for a drawn arrow to live between a note and the editor without
       touching either. Stepped, and not a cqi clamp: the arrow reads this variable from
       inside a card, which is its own container, so a cqi unit in the stored value would
       resolve against the card and hand the arrow a third of the width it needs. */
    --col-gap: 44px;
    grid-template-columns: minmax(400px, 480px) 360px;
    grid-template-rows:
      var(--editor-head) var(--code-pad) repeat(var(--lines), var(--line-h))
      var(--code-pad);
    justify-content: center;
    column-gap: var(--col-gap);
    row-gap: 0;

    /* the scroll tour that walks the callouts (lib/scroll-tour) */
    ${tourTimeline};
  }

  @container section (min-width: 1000px) {
    --col-gap: 52px;
  }

  @container section (min-width: 1200px) {
    --col-gap: 64px;
  }

  @container section (min-width: ${container.section.annotate}) {
    /* Three a side. The card columns take between 250px and 300px: below 250px the
       longest card title wraps and the taller cards start crowding their neighbours. The
       annotate breakpoint is 400 + 2 * 250 + the column gaps. */
    grid-template-columns: minmax(250px, 300px) minmax(400px, 480px) minmax(250px, 300px);
  }
`;

/* only rendered visibly in the wide layout, where the cards annotate it */
const Editor = styled.div`
  ${editorSurface};
  /* the switcher flips pills ↔ dropdown with the editor's own width */
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

/* one per callout: a band over its lines, a grid item on the same rows as its card,
   inset to the code area and painted above the editor (it comes later in the DOM).
   Invisible unless the scroll tour reveals it. */
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
  ${cardStyles};
  --leader-off: light-dark(${light.beige6}, ${dark.navy6});
  --leader-on: light-dark(${light.red}, ${dark.red});
  --leader: var(--leader-off);
  border-color: light-dark(${light.beige5}, ${dark.navy5});
  border-radius: 16px;
  /* the card picks its inner layout from its own width, wherever the grid puts it. An
     element can't query its own container, so the switching happens one level down in
     CardBody. */
  container: card / inline-size;
  padding: 20px 22px;

  @container section (min-width: ${container.section.annotateOne}) {
    position: relative;
    grid-column: 2;
    grid-row: var(--row) / span var(--span);
    align-self: center;
    /* Beside the editor the frame comes off. Six boxes around one editor made the
       section read as a form, and the drawn arrow already says which lines a note is
       about. The padding stays, because it is the pointer's target. */
    background: none;
    border: none;
    box-shadow: none;
    padding: 6px 10px;
    --desc-gap: 2px;
    --desc-size: 13px;
    --desc-lh: 18px;

    /* the arrow turns accent while the scroll tour is on this card's lines */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${leaderAccent} linear both;
        ${tourWindow};
      }
    }

    ${tourPointerOverride};

    /* the pointer picks a callout directly and holds it for as long as it rests there */
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

/**
 * The drawn arrow from a note to the lines it is about. It sizes to the column gap and
 * stops 5px short of the editor, so it never lands on the code.
 *
 * It points left by default, because every note sits right of the editor until the
 * two-sided layout exists. `data-side` is on the card at every width, so the mirror
 * belongs to the same container query that moves a card into column 1.
 */
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

/**
 * The note's title, with the highlighter stroke that marks the callout the tour is on.
 *
 * `inline-block` is the point: a block title stretches to the column, and the stroke
 * would paint the whole width instead of the words.
 */
const CardTitle = styled.h3`
  ${subsectionHeading};
  line-height: 22px;

  @container section (min-width: ${container.section.annotateOne}) {
    display: inline-block;
    --marker: light-dark(
      color-mix(in oklch, ${light.red} 24%, transparent),
      color-mix(in oklch, ${dark.red} 30%, transparent)
    );
    background-image: linear-gradient(to right, var(--marker), var(--marker));
    background-repeat: no-repeat;
    background-position: 0 82%;
    background-size: 0% 60%;
    /* four unequal radii, so the stroke reads as a pen and not as a rectangle */
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

  /* wide enough for copy beside code: a text column and a shared code column */
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

/* the card's own slice of the code; stands in for the editor while that is hidden */
const CardCode = styled.div`
  padding-top: 14px;
  /* mono metrics so the \`ch\`-based width below matches the code inside. One width for
     every card: the longest slice (plus half a character of slack) and the box padding,
     so the boxes line up instead of each hugging its own line. */
  font-family: ${fonts.mono};
  font-size: ${CODE_FONT_SIZE};
  --code-w: calc((var(--code-cols) + 0.5) * 1ch + 24px);

  @container card (min-width: ${container.card.row}) {
    /* the shared code column of the row layout */
    flex: 0 0 var(--code-w);
    padding-top: 0;
  }

  @container section (min-width: ${container.section.annotateOne}) {
    display: none;
  }
`;

/* the dark ink box around the slice; the shared code reset keeps the <pre> itself
   transparent, so the surface lives on this wrapper */
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
