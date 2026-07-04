import { css, styled } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { maxContentWidth } from "@/tokens";
import WaveDivider from "./wave-divider";

/**
 * A full-width landing-page section. Sets the background and, when `wave` is set,
 * adds the in-flow wave dividers used between the beige bands: `true` for both
 * edges, or `"top"`/`"bottom"` for one — the last section uses `"top"` so the page
 * doesn't end on a scalloped edge. Pair with <Container> for the padded inner column.
 */
export function Section({
  background,
  wave = false,
  className,
  style,
  children,
}: {
  background: string;
  wave?: boolean | "top" | "bottom";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const top = wave === true || wave === "top";
  const bottom = wave === true || wave === "bottom";
  return (
    <Outer
      $bg={background}
      $waveTop={top}
      $waveBottom={bottom}
      className={className}
      style={style}
    >
      {top ? <WaveDivider background={background} /> : null}
      {children}
      {bottom ? <WaveDivider background={background} flip /> : null}
    </Outer>
  );
}

/**
 * The inner column of a section: vertical flow plus the shared horizontal
 * gutter. Set the per-section vertical padding via the `css` prop, e.g.
 * `css={css\`padding-top: 56px; padding-bottom: 96px;\`}`.
 */
export const Container = styled.div`
  /* a query container so section content can respond to its own width (see the
     @container section rules in the sections), independent of the fluid gutter */
  container: section / inline-size;

  max-width: ${maxContentWidth};
  margin-inline: auto;

  /* gutter scales with the viewport instead of jumping at a breakpoint — a sudden
     jump would fight the content's @container queries (a wider viewport could briefly
     leave less room, flipping columns the wrong way) */
  padding-left: clamp(20px, 5vw, 48px);
  padding-right: clamp(20px, 5vw, 48px);

  /* vertical rhythm between section blocks */
  & > * + * {
    margin-top: clamp(28px, 4vw, 40px);
  }
`;

const Outer = styled.section<{ $bg: string; $waveTop: boolean; $waveBottom: boolean }>`
  /* The background is painted as a clipped layer so the wave-divider strips stay
     unpainted: the divider's own below-curve fill supplies the wavy edge there and
     the area above the curve is real transparency (the pinned hero shows through).
     The clip stops 1px inside each strip so the two same-color layers overlap
     instead of meeting at an anti-aliased hairline seam. */
  --section-bg: ${({ $bg }) => $bg};
  background-image: linear-gradient(var(--section-bg), var(--section-bg));
  background-repeat: no-repeat;
  background-position: 0 var(--wave-clip-top, 0px);
  background-size: 100% calc(100% - var(--wave-clip-top, 0px) - var(--wave-clip-bottom, 0px));

  ${({ $waveTop }) =>
    $waveTop &&
    css`
      --wave-clip-top: 37px;
    `}
  ${({ $waveBottom }) =>
    $waveBottom &&
    css`
      --wave-clip-bottom: 37px;
    `}
  ${({ $waveTop, $waveBottom }) =>
    ($waveTop || $waveBottom) &&
    css`
      position: relative;
      z-index: 0;
    `}
`;
