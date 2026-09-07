import { styled } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { maxContentWidth, light, dark } from "@/tokens";
import WaveDivider from "./wave-divider";

/**
 * A full-width landing-page section. Sections alternate between the page's beige and
 * the raised beige by position, so no section declares a colour: odd `<section>`s
 * among their siblings are the page tone, even ones the raised tone (see Outer). The
 * hero wrapper holds exactly two sections (the plain hero and the performance section),
 * so the count carries on correctly for the sections after it; keep it at an even
 * number if that block ever changes.
 *
 * The raised bands carve wavy edges into the page tone: every even section gets the
 * in-flow wave dividers on both edges, page-tone sections none (a wave in the page's
 * own colour would be invisible, and two waves on one boundary clash). Pair with
 * <Container> for the padded column.
 */
export function Section({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Outer className={className} style={style}>
      <WaveDivider />
      {children}
      <WaveDivider flip />
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

const Outer = styled.section`
  /* The band's tone, by position: the page's own beige for odd sections, the raised
     beige for even ones. The wave dividers read the same variable for their fill. */
  --section-bg: light-dark(${light.beige2}, ${dark.navy2});

  /* The background is painted as a clipped layer so the wave-divider strips stay
     unpainted: the divider's own below-curve fill supplies the wavy edge there and
     the area above the curve is real transparency (the pinned hero shows through).
     The clip stops 1px inside each strip so the two same-color layers overlap
     instead of meeting at an anti-aliased hairline seam. Page-tone sections have no
     strips (their waves are hidden), so their clip is zero. */
  background-image: linear-gradient(var(--section-bg), var(--section-bg));
  background-repeat: no-repeat;
  background-position: 0 var(--wave-clip, 0px);
  background-size: 100% calc(100% - 2 * var(--wave-clip, 0px));

  & > svg {
    display: none;
  }

  /* raised: the other beige, and waves on both edges */
  &:nth-of-type(even) {
    --section-bg: light-dark(${light.beige3}, ${dark.navy3});
    --wave-clip: 37px;
    position: relative;
    z-index: 0;

    & > svg {
      display: block;
    }
  }
`;
