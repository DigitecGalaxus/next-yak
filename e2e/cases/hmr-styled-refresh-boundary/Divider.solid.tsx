/**
 * Styled-only file — exercises HMR refresh boundary detection.
 *
 * yak stamps the `@refresh component` pragma on exported styled initializers
 * (solidjs/solid#3090), so solid-refresh registers them and this module
 * accepts edits itself. Without that registration the update would propagate
 * up to the importing component module and re-create <App />, resetting its
 * signal state.
 */
import { styled } from "@yak/solid";

export const Divider = styled.hr`
  background-color: red;
  height: 2px;
  border: 0;
`;
