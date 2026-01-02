import { css, ident } from "next-yak";

// Dashed ident (CSS custom property)
export const thumbSize = ident`--thumb-size`;

// Non-dashed ident (grid-area, etc.)
export const trackArea = ident`track`;

// CSS mixin using the idents
export const sliderStyles = css`
  ${thumbSize.name}: 24px;
  width: ${thumbSize};
  grid-area: ${trackArea};
`;
