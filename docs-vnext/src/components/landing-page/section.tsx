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
    <Outer $bg={background} $wave={top || bottom} className={className} style={style}>
      {top ? <WaveDivider /> : null}
      {children}
      {bottom ? <WaveDivider flip /> : null}
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

const Outer = styled.section<{ $bg: string; $wave: boolean }>`
  background: ${({ $bg }) => $bg};
  ${({ $wave }) =>
    $wave &&
    css`
      position: relative;
      z-index: 0;
    `}
`;
