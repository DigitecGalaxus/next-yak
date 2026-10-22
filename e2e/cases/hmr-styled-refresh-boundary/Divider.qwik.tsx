/**
 * Styled-only file — exercises HMR boundary detection: an edit here must
 * update the divider without re-creating <App /> and its signal state.
 */
import { styled } from "@yak/qwik";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
