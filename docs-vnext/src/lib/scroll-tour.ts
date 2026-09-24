import { css } from "next-yak";

/**
 * Scroll-driven tour: the block uses `tourTimeline` and sets `--n` turns; each participant
 * sets `--i` and uses `tourWindow`. Keep keyframes in the using component: a `keyframes`
 * name imported from another module is not resolved by next-yak.
 */
export const tourTimeline = css`
  view-timeline: --tour block;
  /* a reading line in the upper third: the tour runs while the block crosses it */
  view-timeline-inset: 30% 60%;
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

/** While the block has `data-tour-hover`, `[data-active]` rules pick the turn. Declare after `animation`. */
export const tourPointerOverride = css`
  [data-tour-hover] & {
    animation: none;
  }
`;
