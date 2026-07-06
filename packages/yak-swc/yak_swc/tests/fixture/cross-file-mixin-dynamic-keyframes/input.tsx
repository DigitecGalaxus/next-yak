import { css, keyframes } from "next-yak";

const sweep = keyframes`
  from {
    background-position: -600px 0;
  }
  to {
    background-position: 600px 0;
  }
`;

// A local keyframe referenced from an exported dynamic mixin (issue #419):
// the @keyframes definition stays in this file's css - the consumer's
// unconditional __yak_use reference keeps this module (and therefore the
// definition) from being tree-shaken away.
export const animated = css<{ $fast: boolean }>`
  animation: ${sweep} 2s infinite linear;
  ${({ $fast }) =>
    $fast &&
    css`
      animation-duration: 0.5s;
    `}
`;
