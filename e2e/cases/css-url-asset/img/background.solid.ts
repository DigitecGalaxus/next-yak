import { css } from "@yak/solid";

// index.tsx inlines this mixin, so the url has to be rewritten to "./img/assets/mixin.png"
export const mixinBackground = css`
  background: url("./assets/mixin.png") no-repeat center / contain;
`;
