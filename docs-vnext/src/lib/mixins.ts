import { css } from "next-yak";
import { fonts, fontSize, fontWeight, light, dark, scrim } from "@/tokens";

export const keycapStyles = css`
  padding: 2px 8px;
  border: 1.5px solid light-dark(${light.violet}, ${dark.white});
  border-radius: 6px;
  background: light-dark(${light.beige4}, ${dark.navy4});
  font-family: ${fonts.mono};
  font-size: 13px;
  font-weight: 700;
  color: light-dark(${light.violet}, ${dark.white});
`;

export const backdropStyles = css`
  position: fixed;
  inset: 0;
  background: ${scrim};
  backdrop-filter: blur(2px);
`;

export const subsectionHeading = css`
  font-size: ${fontSize.h3};
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.violet}, ${dark.white});
`;

/**
 * The auto-measured sliding highlight behind a Base UI Tabs pill group — the shared
 * motion mechanic for the editor switcher and the coverage framework tabs. Consumers
 * add their own border-radius / background / outline.
 */
export const slidingIndicator = css`
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  width: var(--active-tab-width);
  height: var(--active-tab-height);
  transform: translate(var(--active-tab-left), var(--active-tab-top));

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.26s cubic-bezier(0.34, 1.12, 0.5, 1),
      width 0.26s cubic-bezier(0.34, 1.12, 0.5, 1);
  }
`;

export const overline = css`
  font-family: ${fonts.mono};
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
`;

/**
 * A focus-visible ring. next-yak mixins are static, so the parts that vary are read
 * from CSS variables rather than arguments: it defaults to the violet accent at a 2px
 * offset; set `--focus-ring` (color) and/or `--focus-ring-offset` at the call site for
 * the tighter cyan ring used on the dark editor surface.
 */
export const focusRing = css`
  outline: 2px solid var(--focus-ring, light-dark(${light.violet}, ${dark.white}));
  outline-offset: var(--focus-ring-offset, 2px);
`;

/**
 * The small uppercase label above a docs sidebar group and the on-page TOC heading
 * (nav-tree's SectionLabel, toc's Heading). Each consumer adds only its own margins.
 */
export const sectionLabel = css`
  ${overline};
  font-size: 13px;
  letter-spacing: 0.6px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

/**
 * A tighter overline for small mono captions (the coverage terminal / "works with"
 * labels). Consumers set their own color.
 */
export const overlineSmall = css`
  ${overline};
  font-size: 13px;
  letter-spacing: 1.5px;
`;

/** The inline `<code>` chip — shared by the landing <Code> and the docs prose. */
export const inlineCode = css`
  font-family: ${fonts.mono};
  /* stays slightly smaller than surrounding text, but never dips below the 13px floor */
  font-size: max(0.88em, 13px);
  color: light-dark(${light.violet}, ${dark.white});
  background: light-dark(${light.beige4}, ${dark.navy4});
  padding: 2px 5px;
  border-radius: 5px;
`;
