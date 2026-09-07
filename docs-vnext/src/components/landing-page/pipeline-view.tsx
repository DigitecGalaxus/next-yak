"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type ReactNode } from "react";
import { container, fonts, fontWeight, ink, light, dark } from "@/tokens";
import { editorSurface, codeReset } from "@/lib/editor-surface";
import { overlineSmall } from "@/lib/mixins";
import { tourTimeline, tourWindow } from "@/lib/scroll-tour";
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
 * lib/scroll-tour) walks three turns of matching lines across the panes.
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
          <Pane title="Button.tsx" html={input.html} bands={bands.input} />
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
          <Chip>🦀 yak-swc</Chip>
          <ChipCaption>inside {host.label}</ChipCaption>
          <LineOut />
          <ElbowDown />
        </Node>
        <Outputs>
          <Pane title="Button.js" html={js.html} bands={bands.js} />
          <Pane title="Button.css" html={stylesheet.html} bands={bands.css} />
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

function Pane({
  title,
  html,
  bands = [],
  className,
  style,
}: {
  title: string;
  html: string;
  bands?: Band[];
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
  --chip-w: 116px;
  --col-gap: 32px;
  /* how far a connector reaches into the column gap: up to 6px short of the pane */
  --reach: calc(var(--col-gap) - 6px);

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
    /* three quick turns while the row is in view, not spread over the whole trip */
    --tour-start: 25%;
    --tour-span: 40%;
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

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${bandReveal} linear both;
      ${tourWindow};
    }
  }
`;

/* the plugin between input and outputs, with its connectors. Stacked (arrow in from
   above, chip, arrow out below) until the section is wide enough for the row. In the
   row everything is pinned to the axis: arrow in from the input, chip, arrow out to the
   JS pane, and one elbow down to the CSS pane. */
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

const Chip = styled.span`
  box-sizing: border-box;
  width: var(--chip-w);
  padding: 8px 12px;
  border: 1px solid ${ink.border};
  border-radius: 10px;
  background: ${ink.card};
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 13px;
  font-weight: ${fontWeight.bold};
  text-align: center;
  white-space: nowrap;

  @container section (min-width: ${container.section.flow}) {
    position: absolute;
    top: var(--axis);
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const ChipCaption = styled.span`
  font-family: ${fonts.mono};
  font-size: 13px;
  letter-spacing: 0.44px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
  white-space: nowrap;

  @container section (min-width: ${container.section.flow}) {
    position: absolute;
    top: calc(var(--axis) + 26px);
    left: 50%;
    transform: translateX(-50%);
  }
`;

const arrowhead = css`
  content: "";
  position: absolute;
  border: 4px solid transparent;
`;

/* stacked: a short vertical hairline with an arrowhead pointing down */
const verticalArrow = css`
  position: relative;
  width: 100%;
  height: 28px;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 6px;
    width: 1px;
    background: light-dark(${light.beige6}, ${dark.navy6});
  }

  &::after {
    ${arrowhead};
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    border-top: 6px solid light-dark(${light.beige6}, ${dark.navy6});
    border-bottom: 0;
  }
`;

/* row: a horizontal hairline on the axis with an arrowhead pointing right */
const horizontalArrow = css`
  position: absolute;
  top: var(--axis);
  width: auto;
  height: 0;
  border-top: 1px solid light-dark(${light.beige6}, ${dark.navy6});

  &::before {
    content: none;
  }

  &::after {
    ${arrowhead};
    right: 0;
    top: -1px;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 6px solid light-dark(${light.beige6}, ${dark.navy6});
    /* no right border: the tip sits exactly on the element's edge, where the line ends */
    border-right: 0;
  }
`;

const LineIn = styled.div`
  ${verticalArrow};

  @container section (min-width: ${container.section.flow}) {
    ${horizontalArrow};
    /* the connectors reach across the column gap to just short of the panes */
    left: calc(-1 * var(--reach));
    right: calc(50% + var(--chip-w) / 2 + 8px);
  }
`;

const LineOut = styled.div`
  ${verticalArrow};

  @container section (min-width: ${container.section.flow}) {
    ${horizontalArrow};
    left: calc(50% + var(--chip-w) / 2 + 8px);
    right: calc(-1 * var(--reach));
  }
`;

/* from under the chip's caption down to the CSS pane's middle, then across to it.
   Row only. */
const ElbowDown = styled.div`
  display: none;

  @container section (min-width: ${container.section.flow}) {
    display: block;
    position: absolute;
    left: 50%;
    right: calc(-1 * var(--reach));
    top: calc(var(--axis) + 50px);
    bottom: calc(var(--css-h) / 2);
    border-left: 1px solid light-dark(${light.beige6}, ${dark.navy6});
    border-bottom: 1px solid light-dark(${light.beige6}, ${dark.navy6});
    border-bottom-left-radius: 14px;

    &::after {
      ${arrowhead};
      right: -1px;
      bottom: -1px;
      transform: translateY(50%);
      border-left: 6px solid light-dark(${light.beige6}, ${dark.navy6});
      border-right: 0;
    }
  }
`;
