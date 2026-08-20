/**
 * Styled-only file — exercises solid-refresh HMR boundary behavior.
 *
 * Unlike React (see hmr-styled-refresh-boundary), yak injects no refresh
 * registration for Solid: vite-plugin-solid owns HMR. This case pins the
 * observed behavior when a styled-only module is edited.
 */
import { styled } from "@yak/solid";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
