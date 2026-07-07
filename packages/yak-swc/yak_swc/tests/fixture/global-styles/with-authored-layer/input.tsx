import { globalCss } from "next-yak";

// Cascade layers are not added automatically — users opt in by authoring
// @layer themselves; the at-rule passes through verbatim.
globalCss`
  @layer base {
    body {
      margin: 0;
    }

    input:focus-visible {
      outline: 2px solid rebeccapurple;
    }
  }
`;
