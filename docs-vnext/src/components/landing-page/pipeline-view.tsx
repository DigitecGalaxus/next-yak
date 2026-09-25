"use client";

import { css, keyframes, styled } from "next-yak";
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { container, fonts, fontWeight, ink, shadow, light, dark } from "@/tokens";
import { overlineSmall, editorSurface, codeReset, editorScrollbar } from "@/lib/mixins";
import { tourTimeline, tourWindow, tourPointerOverride } from "@/lib/scroll-tour";
import { SegmentedTabs } from "./segmented-tabs";
import Step from "./step";

export type Band = { line: number; span: number; turn: number };
export type Host = { id: string; label: string; file: string; tab: ReactNode; configHtml: string };
type Snippet = { html: string; lines: number };

const CODE_FONT_SIZE = "13px";
const CODE_LINE_HEIGHT = 1.7;

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
  js: { html: string };
  bands: Record<"input" | "css" | "js", Band[]>;
  turns: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [hostId, setHostId] = useState(hosts[0].id);
  const host = hosts.find((h) => h.id === hostId) ?? hosts[0];
  const [turn, setTurn] = useState<number | null>(null);
  const tour: Tour = {
    active: turn,
    // a touch tap would latch a turn with no way to leave it
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
}: {
  title: string;
  html: string;
  bands?: Band[];
  tour?: Tour;
}) {
  return (
    <PaneFigure>
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
  /* the axis is the vertical middle of the input pane after its diff offset */
  --pane-title: 40px;
  --code-pad: 16px;
  --line-h: calc(${CODE_FONT_SIZE} * ${CODE_LINE_HEIGHT});
  --pane-gap: 16px;
  --in-h: calc(var(--pane-title) + 2 * var(--code-pad) + var(--in-lines) * var(--line-h));
  --css-h: calc(var(--pane-title) + 2 * var(--code-pad) + var(--css-lines) * var(--line-h));
  --axis: calc(var(--in-offset) * var(--line-h) + var(--in-h) / 2);
  --plugin-w: 188px;
  --plugin-h: 84px;
  --col-gap: 32px;
  --reach: calc(var(--col-gap) - 6px);

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
    /* column mins fit the longest config (~47 chars) and JS diff (~44) lines; the flow
       breakpoint is their sum plus the gaps */
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
    /* Last block on the page, with only ~480px of scroll after it. Cap the bottom inset
       and run the tour early so it finishes before the page stops scrolling. */
    view-timeline-inset: 30% min(60%, 520px);
    --tour-start: 2%;
    --tour-span: 38%;
  }
`;

const Yours = styled.div`
  grid-area: in;
  display: flex;
  flex-direction: column;
  gap: var(--pane-gap);

  @container section (min-width: ${container.section.flow}) {
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
  /* this box scrolls, not the <pre>, so the diff tint can bleed into the padding */
  overflow-x: auto;
  ${editorScrollbar};

  ${codeReset};
  pre {
    overflow: visible;
    font-size: ${CODE_FONT_SIZE};
    line-height: ${CODE_LINE_HEIGHT};
  }

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

  /* bands are hover targets for a mouse, which blocks text selection of their lines */
  @media (hover: hover) and (pointer: fine) {
    pointer-events: auto;
  }

  ${tourPointerOverride};

  &[data-active] {
    opacity: 1;
  }
`;

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

/* one period of travel lands the dashes back on themselves, so the loop is seamless */
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

const flowElbow = keyframes`
  to {
    background-position:
      0 calc(100% + var(--wire-period)),
      var(--wire-period) 100%;
  }
`;

/* a dashed border cannot animate, so the dashes are a repeating gradient */
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

const Plugin = styled.div`
  box-sizing: border-box;
  width: var(--plugin-w);
  padding: 12px 14px;
  border: 1px solid ${ink.border};
  border-radius: 14px;
  background: ${ink.card};
  box-shadow: ${shadow.card};
  color: ${ink.fg};
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

const verticalWire = css`
  position: relative;
  width: 2px;
  height: 30px;
  ${dashesDown};
`;

const horizontalWire = css`
  position: absolute;
  top: var(--axis);
  width: auto;
  height: 2px;
  transform: translateY(-50%);
  ${dashesRight};
`;

const LineIn = styled.div`
  ${verticalWire};

  @container section (min-width: ${container.section.flow}) {
    ${horizontalWire};
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

/* one element paints both runs so the dashes travel around the corner in one animation */
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
    /* anchored to the bottom edge so a dash, not a gap, lands on the corner */
    background-position:
      0 100%,
      0 100%;

    @media (prefers-reduced-motion: no-preference) {
      animation: ${flowElbow} 900ms linear infinite;
    }
  }
`;
