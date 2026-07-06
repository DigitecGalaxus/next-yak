import { css } from "next-yak";

// Exported dynamic mixin with a runtime css variable value.
// The payload references the producer-scoped variable (`var(--...)`) while
// the runtime template carries the setter - both keep the producer name at
// every usage site.
export const pad = css<{ $pad: number }>`
  padding: ${({ $pad }) => $pad}px;
  margin: 0;
`;
