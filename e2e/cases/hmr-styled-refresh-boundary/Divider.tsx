/**
 * Styled-only file — the root cause of the HMR full reload.
 *
 * styled() returns a function with .name = "yak" (lowercase).
 * React's isLikelyComponentType checks .name for uppercase → returns false.
 * Without $RefreshReg$, this module is NOT a React Fast Refresh boundary.
 *
 * When this file is edited, the HMR update propagates up through every
 * parent module. If no parent is a boundary, it reaches the webpack entry
 * point and aborts → full page reload.
 */
import { styled } from "next-yak";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
