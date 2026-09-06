"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type ReactNode } from "react";
import { container, fonts, fontSize, ink, light, dark } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { subsectionHeading } from "@/lib/mixins";
import { cardStyles } from "./card";
import { EditorSwitcher } from "@/components/editor-switcher";
import { EditorDots } from "./editor-dots";

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
 * The "why teams pick it" showcase. Highlighting happens on the server
 * (feature-showcase.tsx); this client half tracks the framework tab and lays things out.
 *
 * Wide sections show the editor with the cards snapped to the code they describe. The
 * trick is one grid whose rows mirror the editor (title bar, padding, one row per code
 * line, padding): the editor spans all rows, so a card on `grid-row: line + 2 / span n`
 * lands level with its lines. From `annotate` the cards sit three a side, from
 * `annotateOne` they queue in one compact column. Scrolling tours the callouts: each has
 * a highlight band on its rows, and a view timeline on the grid gives band and card
 * consecutive windows of the scroll range. Pure CSS, progressive enhancement.
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

  // grid rows of a callout's lines, plus its index in the scroll tour
  const placement = (c: Callout, i: number) =>
    ({ "--row": c.line + ROWS_BEFORE_CODE, "--span": c.span, "--i": i }) as CSSProperties;

  return (
    <Grid
      className={className}
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
        <Card key={callout.title} data-side={callout.side} style={placement(callout, i)}>
          <CardBody>
            <CardText>
              <h3
                css={css`
                  ${subsectionHeading};
                  line-height: 22px;
                `}
              >
                {callout.title}
              </h3>
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
        <LineHighlight key={callout.title} aria-hidden style={placement(callout, i)} />
      ))}
    </Grid>
  );
}

/* a band fades in over the first fifth of its window and out over the last fifth, so
   neighbouring bands cross-fade instead of popping */
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

/* an unregistered custom property animates discretely: the leader flips to accent a
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

/* the slice of the grid's scroll range a callout owns: window i of --n, spread over the
   middle 70% of the grid's trip through the viewport, each overlapping its neighbours
   by --tour-overlap so the hand-over is a cross-fade */
const tourWindow = css`
  animation-timeline: --showcase;
  animation-range: cover calc(var(--tour-start) + var(--i) * var(--tour-step) - var(--tour-overlap))
    cover calc(var(--tour-start) + (var(--i) + 1) * var(--tour-step) + var(--tour-overlap));
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
    --col-gap: clamp(20px, 3cqi, 40px);
    grid-template-columns: minmax(400px, 480px) 360px;
    grid-template-rows:
      var(--editor-head) var(--code-pad) repeat(var(--lines), var(--line-h))
      var(--code-pad);
    justify-content: center;
    column-gap: var(--col-gap);
    row-gap: 0;

    /* the scroll tour's timeline and pacing (see tourWindow) */
    view-timeline: --showcase block;
    --tour-start: 15%;
    --tour-step: calc(70% / var(--n));
    --tour-overlap: 2%;
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

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${bandReveal} linear both;
        ${tourWindow};
      }
    }
  }

  @container section (min-width: ${container.section.annotate}) {
    grid-column: 2;
  }
`;

const Card = styled.div`
  ${cardStyles};
  /* the softer frame of the benchmark figure and coverage card, not the hard violet
     hairline: these cards sit six in a row and the strong border made them shout */
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
    /* compact: six cards share the column, so each slims down to a title and one line */
    padding: 8px 14px;
    --desc-gap: 2px;
    --desc-size: 13px;
    --desc-lh: 18px;

    /* the leader: a hairline from the card across the gap to the editor, and a dot
       pinned on the editor's edge, both at the card's centre, which is the centre of
       the lines it annotates. Points left here; the two-sided layout flips it for the
       left-hand cards. */
    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      background: var(--leader);
      pointer-events: none;

      @media (prefers-reduced-motion: no-preference) {
        transition: background 0.18s ease;
      }
    }

    &::before {
      right: 100%;
      height: 1px;
      width: var(--col-gap);
      transform: translateY(-50%);
    }

    &::after {
      left: calc(0px - var(--col-gap));
      width: 7px;
      height: 7px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    /* the leader turns accent while the scroll tour is on this card's lines */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        animation: ${leaderAccent} linear both;
        ${tourWindow};
      }
    }
  }

  @container section (min-width: ${container.section.annotate}) {
    padding: 20px 22px;
    --desc-gap: 6px;
    --desc-size: ${fontSize.small};
    --desc-lh: 1.5;

    &[data-side="left"] {
      grid-column: 1;
      text-align: right;

      &::before {
        left: 100%;
        right: auto;
      }

      &::after {
        left: calc(100% + var(--col-gap));
      }
    }

    &[data-side="right"] {
      grid-column: 3;
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
