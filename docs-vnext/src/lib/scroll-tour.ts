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
 */
export const tourTimeline = css`
  view-timeline: --tour block;
  /* the turns share --tour-span of the block's trip through the viewport, starting at
     --tour-start, each overlapping its neighbours by --tour-overlap so hand-overs
     cross-fade. Override the first two on the block for a faster or later tour. */
  --tour-start: 15%;
  --tour-span: 70%;
  --tour-step: calc(var(--tour-span) / var(--n));
  --tour-overlap: 2%;
`;

/** Turn `--i` of `--n`; declare after the `animation` shorthand, which resets both. */
export const tourWindow = css`
  animation-timeline: --tour;
  animation-range: cover calc(var(--tour-start) + var(--i) * var(--tour-step) - var(--tour-overlap))
    cover calc(var(--tour-start) + (var(--i) + 1) * var(--tour-step) + var(--tour-overlap));
`;
