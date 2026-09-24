import { css } from "next-yak";
import { fontSize, fontWeight, light, dark } from "@/tokens";

/**
 * The link roles. Before this file the site had 4 rest colours, 3 decorations and 4 hover
 * colours across 14 components, with no rule a reader could state.
 *
 * A call to action is not a link role. It is a button, so it takes `buttonStyles`, the
 * same one the hero and the docs prev and next pair use.
 *
 * Arrows: an ExternalMark arrow marks a link that leaves the site. A right arrow belongs
 * to a button. A link in either role below carries no arrow.
 */

/**
 * Inside running text, where nothing else marks the link. It rests red and underlined, so
 * the hover deepens the red and thickens the rule rather than reaching for a new colour.
 */
export const proseLink = css`
  color: light-dark(${light.red}, ${dark.red});
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover,
  &:focus-visible {
    color: light-dark(${light.redDeep}, ${dark.redDeep});
    text-decoration-thickness: 2px;
  }
`;

/**
 * In the chrome: the header nav, the footer columns, a back link. It rests in the colour
 * of the text around it and answers a pointer with red, the one colour a link reaches for
 * on this site.
 */
export const chromeLink = css`
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.15s ease;
  }

  &:hover,
  &:focus-visible {
    color: light-dark(${light.red}, ${dark.red});
  }
`;

/**
 * A row in a rail: the docs sidebar and the blog post list. A row is not inline text, so
 * it answers with a tinted surface rather than the red the chrome links use. Red on a
 * tinted row reads as an error.
 */
export const railLink = css`
  display: block;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: ${fontSize.small};
  line-height: 1.4;
  color: light-dark(${light.violetSoft}, ${dark.fog});
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      color 0.12s ease,
      background 0.12s ease;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    color: light-dark(${light.violet}, ${dark.white});
    background: light-dark(${light.beige3}, ${dark.navy3});
  }
`;

/**
 * The row the reader is on. The red bar marks a position, and the text stays violet: red
 * text would say "a link you can follow", and the current page is the one row that is not.
 */
export const railLinkActive = css`
  position: relative;
  color: light-dark(${light.violet}, ${dark.white});
  font-weight: ${fontWeight.semibold};
  background: light-dark(${light.beige3}, ${dark.navy3});

  /* at the rail's edge, outside the padded row */
  &::before {
    content: "";
    position: absolute;
    left: -10px;
    top: 4px;
    bottom: 4px;
    width: 3px;
    border-radius: 2px;
    background: light-dark(${light.red}, ${dark.red});
  }
`;
