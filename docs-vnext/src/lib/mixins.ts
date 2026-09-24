import { css } from "next-yak";
import { fonts, fontSize, fontWeight, light, dark, ink, scrim, shadow } from "@/tokens";

export const keycapStyles = css`
  padding: 2px 8px;
  border: 1.5px solid light-dark(${light.violet}, ${dark.navy5});
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

// Mixins take no arguments. Set `--focus-ring` / `--focus-ring-offset` at the call site to vary it.
export const focusRing = css`
  outline: 2px solid var(--focus-ring, light-dark(${light.violet}, ${dark.white}));
  outline-offset: var(--focus-ring-offset, 2px);
`;

export const sectionLabel = css`
  ${overline};
  font-size: 13px;
  letter-spacing: 0.6px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

export const overlineSmall = css`
  ${overline};
  font-size: 13px;
  letter-spacing: 1.5px;
`;

export const inlineCode = css`
  font-family: ${fonts.mono};
  font-size: max(0.88em, 13px);
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.violet}, ${dark.white});
  background: light-dark(
    color-mix(in srgb, ${light.violet} 8%, transparent),
    color-mix(in srgb, ${dark.white} 10%, transparent)
  );
  box-shadow: inset 0 0 0 1px
    light-dark(
      color-mix(in srgb, ${light.violet} 14%, transparent),
      color-mix(in srgb, ${dark.white} 16%, transparent)
    );
  padding: 2px 5px;
  border-radius: 5px;
`;

export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

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

export const railLinkActive = css`
  position: relative;
  color: light-dark(${light.violet}, ${dark.white});
  font-weight: ${fontWeight.semibold};
  background: light-dark(${light.beige3}, ${dark.navy3});

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

export const editorSurface = css`
  border: 1px solid ${ink.border};
  border-radius: 12px;
  background: ${ink.card};
  box-shadow: ${shadow.card};
  overflow: hidden;
`;

export const editorHeader = css`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 12px;
  border-bottom: 2px solid ${ink.border};
`;

export const codeReset = css`
  pre {
    margin: 0;
    overflow-x: auto;
    font-family: ${fonts.mono};
    background: transparent !important;
  }

  code {
    font-family: inherit;
  }
`;

export const proseStyles = css`
  h2,
  h3,
  h4 {
    color: light-dark(${light.violet}, ${dark.white});
    line-height: 1.25;
  }
  h2 {
    font-size: 26px;
    margin-top: 52px;
  }
  h3 {
    font-size: 20px;
    margin-top: 32px;
  }
  p {
    margin: 12px 0;
  }
  p a,
  li a,
  td a,
  blockquote a {
    ${proseLink};
  }
  /* keeps heading anchors inside <li> (Steps) out of the li a rule above */
  h2 a,
  h3 a,
  h4 a {
    color: inherit;
    text-decoration: none;
  }
  ul,
  ol {
    margin: 12px 0;
    padding-left: 22px;
  }
  li {
    margin: 4px 0;
  }
  & :not(pre) > code {
    ${inlineCode};
  }
  table {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
    font-size: 14px;
  }
  th,
  td {
    padding: 6px 10px;
    text-align: left;
  }
  blockquote {
    margin: 16px 0;
    padding-left: 14px;
    border-left: 3px solid light-dark(${light.violet}, ${dark.white});
  }
`;
