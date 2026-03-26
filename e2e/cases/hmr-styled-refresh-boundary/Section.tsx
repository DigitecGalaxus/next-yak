/**
 * Styled-only file — exports ONLY styled() components, no FunctionComponent.
 *
 * Without $RefreshReg$ registration, editing this file causes
 * "[Fast Refresh] performing full reload" when it's in the _app tree.
 * With the fix, Fast Refresh recognizes it as a component module and
 * hot-swaps the CSS without a full reload.
 */
import { styled } from "next-yak";

export const Section = styled.section`
  color: red;
  padding: 16px;
`;
