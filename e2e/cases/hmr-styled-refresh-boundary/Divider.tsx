/**
 * Styled-only file — exercises HMR refresh boundary detection.
 *
 * The yak SWC plugin injects $RefreshReg$ for exported styled components
 * so that this module is recognized as a React Fast Refresh boundary.
 * Without that, the HMR update would propagate up through every parent
 * module until it reaches the entry point → full page reload.
 */
import { styled } from "next-yak";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
