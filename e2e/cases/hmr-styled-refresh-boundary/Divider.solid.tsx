/**
 * Styled-only file — exercises HMR refresh boundary detection.
 *
 * State above this module survives a JS edit only if the module accepts the
 * update itself, which requires its styled exports to be registered with
 * solid-refresh. Unregistered, the update propagates up to the importing
 * component module and re-creates <App />, resetting its signal state.
 */
import { styled } from "@yak/solid";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
