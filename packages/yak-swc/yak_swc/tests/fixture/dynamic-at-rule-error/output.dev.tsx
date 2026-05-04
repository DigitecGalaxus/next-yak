import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Dynamic interpolation inside @media query is not valid CSS:
// the browser cannot read CSS variables before the media query is evaluated.
const Box = /*YAK Extracted CSS:
:global(.input_Box_m7uBBu) {
  background: red;
  @media {
    display: none;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Box_m7uBBu", (p)=>p.theme.queries.desktopAndAbove), {
    "displayName": "Box"
});
