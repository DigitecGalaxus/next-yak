import { styled } from "@yak/react/internal";
import * as __yak from "@yak/react/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Dynamic interpolation inside @media query is not valid CSS:
// the browser cannot read CSS variables before the media query is evaluated.
const Box = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  background: red;
  @media {
    display: none;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", (p)=>p.theme.queries.desktopAndAbove);
