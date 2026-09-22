"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { container, fonts, fontWeight, ink, shadow, light, dark } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { overlineSmall } from "@/lib/mixins";
import { tourTimeline, tourWindow, tourPointerOverride } from "@/lib/scroll-tour";
import { SegmentedTabs } from "./segmented-tabs";
import Step from "./step";

export type Band = { line: number; span: number; turn: number };
export type Host = { id: string; label: string; file: string; tab: ReactNode; configHtml: string };
type Snippet = { html: string; lines: number };

const CODE_FONT_SIZE = "13px";
const CODE_LINE_HEIGHT = 1.7;

/**
 * Layout for the pipeline (see pipeline.tsx for what it shows). Wide sections lay it
 * out in a row: the input and the JS pane share one horizontal axis through the plugin
 * chip, with the input shifted down by the diff's leading added line so its lines sit
 * level with the removed lines it became; the bundler config hangs under the input,
 * the CSS pane under a single elbow from the chip, and the steps sit beneath their
 * column. Narrow sections stack everything in reading order. The scroll tour (see
 * lib/scroll-tour) walks three turns of matching lines across the panes. A mouse or a
 * pen takes it over: resting on a band holds its turn lit in every pane.
 */
export default function PipelineView({
  hosts,
  input,
  stylesheet,
  js,
  bands,
  turns,
  className,
  style,
}: {
  hosts: readonly Host[];
  input: Snippet & { offset: number };
  /** the extracted CSS (named to keep clear of next-yak's `css` prop) */
  stylesheet: Snippet;
  js: Snippet;
  bands: Record<"input" | "css" | "js", Band[]>;
  turns: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [hostId, setHostId] = useState(hosts[0].id);
  const host = hosts.find((h) => h.id === hostId) ?? hosts[0];
  // the turn the pointer rests on; while it is set, it drives the tour instead of scrolling
  const [turn, setTurn] = useState<number | null>(null);
  const tour: Tour = {
    active: turn,
    // a touch tap would latch a turn with no way to leave it, so only mouse and pen take over
    enter: (t) => (event) => {
      if (event.pointerType !== "touch") setTurn(t);
    },
    leave: () => setTurn(null),
  };

  return (
    <div className={className} style={style}>
      <Switch>
        <SwitchLabel>your bundler</SwitchLabel>
        <SegmentedTabs
          value={host.id}
          onValueChange={setHostId}
          items={hosts.map((h) => ({ value: h.id, node: h.tab }))}
          ariaLabel="Bundler"
        />
      </Switch>

      <Diagram
        data-tour-hover={turn !== null || undefined}
        style={
          {
            "--n": turns,
            "--in-lines": input.lines,
            "--in-offset": input.offset,
            "--css-lines": stylesheet.lines,
            "--js-lines": js.lines,
          } as CSSProperties
        }
      >
        <Step
          n={1}
          title="Write"
          css={css`
            grid-area: s1;
          `}
        >
          Author components with the styled API you already know, and add yak to your bundler
          config.
        </Step>
        <Yours>
          <Pane title="Button.tsx" html={input.html} bands={bands.input} tour={tour} />
          <Pane title={host.file} html={host.configHtml} />
        </Yours>
        <Step
          n={2}
          title="Compile"
          css={css`
            grid-area: s2;
          `}
        >
          The Rust SWC plugin runs inside your bundler, moves the static styles into a CSS file and
          leaves a class reference behind.
        </Step>
        <Node aria-hidden>
          <LineIn />
          <Plugin>
            <PluginTitle>🦀 yak-swc</PluginTitle>
            <PluginCaption>inside {host.label}</PluginCaption>
          </Plugin>
          <LineOut />
          <ElbowDown />
        </Node>
        <Outputs>
          <Pane title="Button.js" html={js.html} bands={bands.js} tour={tour} />
          <Pane title="Button.css" html={stylesheet.html} bands={bands.css} tour={tour} />
        </Outputs>
        <Step
          n={3}
          title="Ship"
          css={css`
            grid-area: s3;
          `}
        >
          The browser gets a plain stylesheet and a component that carries a class name. No styling
          runtime.
        </Step>
      </Diagram>
    </div>
  );
}

/** The turn the pointer holds, and the handlers that let a band take or release it. */
type Tour = {
  active: number | null;
  enter: (turn: number) => (event: PointerEvent) => void;
  leave: () => void;
};

function Pane({
  title,
  html,
  bands = [],
  tour,
  className,
  style,
}: {
  title: string;
  html: string;
  bands?: Band[];
  tour?: Tour;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <PaneFigure data-ink className={className} style={style}>
      <PaneTitle>{title}</PaneTitle>
      <PaneCode>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {bands.map((band) => (
          <TourBand
            key={`${band.line}-${band.turn}`}
            aria-hidden
            data-active={tour?.active === band.turn || undefined}
            onPointerEnter={tour?.enter(band.turn)}
            onPointerLeave={tour?.leave}
            style={{ "--line": band.line, "--span": band.span, "--i": band.turn } as CSSProperties}
          />
        ))}
      </PaneCode>
    </PaneFigure>
  );
}

const Switch = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 28px;
`;

const SwitchLabel = styled.span`
  ${overlineSmall};
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const Diagram = styled.div`
  /* pane geometry the connectors and tour bands are computed from: every pane is a
     title bar, padded code, one line per source line; the row is as tall as the two
     stacked outputs; the axis is the input's vertical middle once it is shifted down to
     match the diff */
  --pane-title: 40px;
  --code-pad: 16px;
  --line-h: calc(${CODE_FONT_SIZE} * ${CODE_LINE_HEIGHT});
  --pane-gap: 16px;
  --in-h: calc(var(--pane-title) + 2 * var(--code-pad) + var(--in-lines) * var(--line-h));
  --css-h: calc(var(--pane-title) + 2 * var(--code-pad) + var(--css-lines) * var(--line-h));
  --js-h: calc(var(--pane-title) + 2 * var(--code-pad) + var(--js-lines) * var(--line-h));
  --axis: calc(var(--in-offset) * var(--line-h) + var(--in-h) / 2);
  --plugin-w: 188px;
  --plugin-h: 84px;
  --col-gap: 32px;
  /* how far a connector reaches into the column gap: up to 6px short of the pane */
  --reach: calc(var(--col-gap) - 6px);

  /* The wire. It used to be a 1px hairline two lightness steps off the paper, which made
     the one idea of this section the faintest thing in it. Now it is 2px of dashes in a
     tone mixed halfway to the accent, and the dashes travel, so the direction reads
     without the reader tracing a line. */
  --wire: light-dark(
    color-mix(in oklch, ${light.violetSoft} 55%, ${light.beige2}),
    color-mix(in oklch, ${dark.fog} 55%, ${dark.navy2})
  );
  --wire-dash: 7px;
  --wire-period: 13px;

  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "s1"
    "in"
    "s2"
    "node"
    "out"
    "s3";

  @container section (min-width: ${container.section.flow}) {
    /* the "yours" column is sized for the config file's longest line (~47 chars), the
       outputs for the JS diff's (~44) and stop growing before the panes turn into empty
       ink; the plugin column takes what is left, up to 320px, so the connectors have room
       to read as a pipeline. The mins plus gaps are what the flow breakpoint guarantees. */
    grid-template-columns: minmax(320px, 420px) minmax(180px, 320px) minmax(390px, 520px);
    grid-template-areas:
      "in node out"
      "s1 s2 s3";
    column-gap: var(--col-gap);
    row-gap: 32px;
    align-items: start;
  }

  @supports (animation-timeline: view()) {
    ${tourTimeline};
    /* This block is the last one on the page: only about 480px of scroll follow it, and
       the default tour needs more than that on a tall viewport. Two corrections. First,
       cap how far the reading line sits above the bottom of the screen, so a tall
       viewport cannot push the start of the tour past the point where the page stops
       scrolling. Second, run the three turns off early, while the block travels from the
       reading line up to the top of the screen. */
    view-timeline-inset: 30% min(60%, 520px);
    --tour-start: 2%;
    --tour-span: 38%;
  }
`;

/* what you write: the component on the axis, the bundler config beneath it */
const Yours = styled.div`
  grid-area: in;
  display: flex;
  flex-direction: column;
  gap: var(--pane-gap);

  @container section (min-width: ${container.section.flow}) {
    /* line the component up with the removed block in the diff */
    margin-top: calc(var(--in-offset) * var(--line-h));
  }
`;

const Outputs = styled.div`
  grid-area: out;
  display: flex;
  flex-direction: column;
  gap: var(--pane-gap);
`;

const PaneFigure = styled.figure`
  ${editorSurface};
  display: flex;
  flex-direction: column;
`;

const PaneTitle = styled.figcaption`
  box-sizing: border-box;
  height: var(--pane-title);
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-family: ${fonts.mono};
  font-size: 13px;
  color: ${ink.fgMuted};
  border-bottom: 2px solid ${ink.divider};
`;

const PaneCode = styled.div`
  position: relative;
  padding: var(--code-pad) 18px;
  /* this box scrolls long lines, not the <pre>, so the diff tint below can bleed into
     the padding without creating a scrollable overflow */
  overflow-x: auto;

  ${codeReset};
  pre {
    overflow: visible;
    font-size: ${CODE_FONT_SIZE};
    line-height: ${CODE_LINE_HEIGHT};
  }

  /* diff lines: a full-width tint (the line box is widened into the padding so it runs
     edge to edge) and a +/- in the left gutter */
  .line[data-diff] {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: calc(100% + 36px);
    margin-inline: -18px;
    padding-inline: 18px;
    border-radius: 3px;

    &::before {
      position: absolute;
      left: 5px;
      font-weight: ${fontWeight.bold};
    }
  }

  .line[data-diff="add"] {
    background: color-mix(in oklch, ${ink.success} 16%, transparent);

    &::before {
      content: "+";
      color: ${ink.success};
    }
  }

  .line[data-diff="remove"] {
    background: color-mix(in oklch, ${ink.dotRed} 18%, transparent);

    &::before {
      content: "-";
      color: ${ink.dotRed};
    }
  }
`;

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

/* a band over lines --line..--line+--span of its pane, shown during tour turn --i */
const TourBand = styled.div`
  position: absolute;
  left: 6px;
  right: 6px;
  top: calc(var(--code-pad) + (var(--line) - 1) * var(--line-h));
  height: calc(var(--span) * var(--line-h));
  border-radius: 4px;
  background: ${ink.hover};
  opacity: 0;
  pointer-events: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.15s ease;
  }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${bandReveal} linear both;
      ${tourWindow};
    }
  }

  /* with a mouse the bands are also the targets: resting on one lines up the same code
     in every pane. They cover the lines they mark, so this costs selecting those lines. */
  @media (hover: hover) and (pointer: fine) {
    pointer-events: auto;
  }

  ${tourPointerOverride};

  &[data-active] {
    opacity: 1;
  }
`;

/* The plugin between input and outputs, with its wires. Stacked (wire in from above,
   the plugin card, wire out below) until the section is wide enough for the row. In the
   row everything is pinned to the axis: the wire in from the input lands on the card's
   input port, the wire out leaves the output port for the JS pane, and one elbow drops
   from under the card to the CSS pane. */
const Node = styled.div`
  grid-area: node;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  @container section (min-width: ${container.section.flow}) {
    display: block;
    position: relative;
    align-self: stretch;
  }
`;

/* One period of travel makes the dash pattern land back on itself, so the loop is seamless. */
const flowX = keyframes`
  to {
    background-position-x: var(--wire-period);
  }
`;

const flowY = keyframes`
  to {
    background-position-y: var(--wire-period);
  }
`;

/* down the left edge first, then right along the bottom */
const flowElbow = keyframes`
  to {
    background-position:
      0 calc(100% + var(--wire-period)),
      var(--wire-period) 100%;
  }
`;

/* A dashed border cannot move, and a background can, so the dashes are a repeating
   gradient. The element carries the 2px of height itself. */
const dashesRight = css`
  background-image: repeating-linear-gradient(
    to right,
    var(--wire) 0 var(--wire-dash),
    transparent var(--wire-dash) var(--wire-period)
  );
  background-size: var(--wire-period) 2px;
  background-repeat: repeat-x;
  background-position: 0 50%;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${flowX} 900ms linear infinite;
  }
`;

const dashesDown = css`
  background-image: repeating-linear-gradient(
    to bottom,
    var(--wire) 0 var(--wire-dash),
    transparent var(--wire-dash) var(--wire-period)
  );
  background-size: 2px var(--wire-period);
  background-repeat: repeat-y;
  background-position: 50% 0;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${flowY} 900ms linear infinite;
  }
`;

/* The plugin is the subject of this section, so it is a card with two ports, not a tag.
   The old chip filled three percent of its column and read as a label on the empty gap. */
const Plugin = styled.div`
  box-sizing: border-box;
  width: var(--plugin-w);
  padding: 12px 14px;
  border: 1px solid ${ink.border};
  border-radius: 14px;
  background: ${ink.card};
  box-shadow: ${shadow.card};
  color: ${ink.fg};
  /* the column belongs to both layouts: stacked, a block box ran the title and the
     caption together on one line and pushed the caption past the card */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;

  @container section (min-width: ${container.section.flow}) {
    position: absolute;
    top: var(--axis);
    left: 50%;
    transform: translate(-50%, -50%);
    min-height: var(--plugin-h);
    justify-content: center;

    /* the two ports the horizontal wires land on, centred on the axis */
    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 9px;
      height: 9px;
      box-sizing: border-box;
      border: 2px solid var(--wire);
      border-radius: 50%;
      background: ${ink.card};
      transform: translateY(-50%);
    }

    &::before {
      left: -5px;
    }

    &::after {
      right: -5px;
    }
  }
`;

const PluginTitle = styled.span`
  font-family: ${fonts.mono};
  font-size: 14px;
  font-weight: ${fontWeight.bold};
  white-space: nowrap;
`;

const PluginCaption = styled.span`
  font-family: ${fonts.mono};
  font-size: 12px;
  letter-spacing: 0.44px;
  color: ${ink.fgMuted};
  white-space: nowrap;
`;

/* stacked: a short vertical run. The dashes travel, and that is the direction cue. */
const verticalWire = css`
  position: relative;
  width: 2px;
  height: 30px;
  ${dashesDown};
`;

/* row: a horizontal run on the axis */
const horizontalWire = css`
  position: absolute;
  top: var(--axis);
  width: auto;
  height: 2px;
  transform: translateY(-50%);
  ${dashesRight};

  &::after {
    content: none;
  }
`;

const LineIn = styled.div`
  ${verticalWire};

  @container section (min-width: ${container.section.flow}) {
    ${horizontalWire};
    /* the wires reach across the column gap to just short of the panes */
    left: calc(-1 * var(--reach));
    right: calc(50% + var(--plugin-w) / 2 + 5px);
  }
`;

const LineOut = styled.div`
  ${verticalWire};

  @container section (min-width: ${container.section.flow}) {
    ${horizontalWire};
    left: calc(50% + var(--plugin-w) / 2 + 5px);
    right: calc(-1 * var(--reach));
  }
`;

/* From under the plugin down to the CSS pane's middle, then across to it. One element
   paints both runs, the left edge and the bottom edge, so the dashes travel around the
   corner in one animation. Row only. */
const ElbowDown = styled.div`
  display: none;

  @container section (min-width: ${container.section.flow}) {
    display: block;
    position: absolute;
    left: 50%;
    right: calc(-1 * var(--reach));
    top: calc(var(--axis) + var(--plugin-h) / 2 + 6px);
    bottom: calc(var(--css-h) / 2);

    background-image:
      repeating-linear-gradient(
        to bottom,
        var(--wire) 0 var(--wire-dash),
        transparent var(--wire-dash) var(--wire-period)
      ),
      repeating-linear-gradient(
        to right,
        var(--wire) 0 var(--wire-dash),
        transparent var(--wire-dash) var(--wire-period)
      );
    background-size:
      2px var(--wire-period),
      var(--wire-period) 2px;
    background-repeat: repeat-y, repeat-x;
    /* both runs are anchored to the bottom edge, so a dash always lands on the corner
       instead of a gap falling there */
    background-position:
      0 100%,
      0 100%;

    @media (prefers-reduced-motion: no-preference) {
      animation: ${flowElbow} 900ms linear infinite;
    }
  }
`;
