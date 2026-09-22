import { css } from "next-yak";

/**
 * A scroll-driven "tour": as a block moves through the viewport, a series of elements
 * take turns. The block declares the timeline with `tourTimeline` and sets `--n` (how
 * many turns); each participant sets `--i` (its turn) and animates over `tourWindow`.
 * Pure CSS. Gate the animation behind `@supports (animation-timeline: view())` and
 * `prefers-reduced-motion: no-preference`; without it participants just keep their
 * resting state. The keyframes stay in the component that uses them: a `keyframes` name
 * interpolated from another module isn't resolved at build time and the `animation`
 * shorthand ends up dropped.
 *
 * A pointer can take the tour over: set `data-tour-hover` on the block while a
 * participant is hovered, give every participant `tourPointerOverride`, and style the
 * hovered turn with `[data-active]`.
 */
export const tourTimeline = css`
  view-timeline: --tour block;
  /* The tour follows the reader's eye instead of the block's whole trip through the
     viewport. Insetting the timeline's scrollport to a thin band in the upper third
     leaves a reading line there: progress 0 is the block's first line arriving at that
     line, progress 100% its last line leaving it, so the tour costs about the block's
     own height in scroll and only starts once the reader is actually looking at it. */
  view-timeline-inset: 30% 60%;
  /* the turns share --tour-span of that trip, starting at --tour-start, each overlapping
     its neighbours by --tour-overlap so hand-overs cross-fade. Override the first two on
     the block for a later or a slower tour. */
  --tour-start: 8%;
  --tour-span: 66%;
  --tour-step: calc(var(--tour-span) / var(--n));
  --tour-overlap: 1.5%;
`;

/** Turn `--i` of `--n`; declare after the `animation` shorthand, which resets both. */
export const tourWindow = css`
  animation-timeline: --tour;
  animation-range: cover calc(var(--tour-start) + var(--i) * var(--tour-step) - var(--tour-overlap))
    cover calc(var(--tour-start) + (var(--i) + 1) * var(--tour-step) + var(--tour-overlap));
`;

/**
 * Hands the tour to the pointer: while the block carries `data-tour-hover` the scroll
 * animation stands down, and the participants' own `[data-active]` rules decide which
 * turn shows. Declare on every participant, after the `animation` shorthand. The block
 * sets the attribute for mouse and pen only, so a touch tap cannot latch a turn.
 */
export const tourPointerOverride = css`
  [data-tour-hover] & {
    animation: none;
  }
`;
