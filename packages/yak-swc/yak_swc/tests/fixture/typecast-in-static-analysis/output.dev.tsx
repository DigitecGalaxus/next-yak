import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Numeric constants used inside math expressions, in cast form
const BASE = 16 as const;
const SIZES = {
    sm: 8,
    md: 16
} as const;
// Math evaluator: cast-wrapped numbers and references must still evaluate
const A = /*YAK Extracted CSS:
:global(.input_A_m7uBBu) {
  width: 32px;
  margin: 24px;
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_A_m7uBBu"), {
    "displayName": "A"
});
// Selector reference wrapped in a cast inside a CSS interpolation
const Box = /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Box_m7uBBu"), {
    "displayName": "Box"
});
const B = /*YAK Extracted CSS:
:global(.input_B_m7uBBu) {
  :global(.input_Box_m7uBBu) {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_B_m7uBBu"), {
    "displayName": "B"
});
// Constant lookup through a non-null assertion
const COLOR = "blue";
const C = /*YAK Extracted CSS:
:global(.input_C_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_C_m7uBBu"), {
    "displayName": "C"
});
// Default export through a TS cast
const Page = /*YAK EXPORTED STYLED:Page:input_Page_m7uBBu*//*YAK Extracted CSS:
:global(.input_Page_m7uBBu) {
  display: block;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Page_m7uBBu"), {
    "displayName": "Page"
});
export default /*YAK EXPORTED STYLED:default:input_Page_m7uBBu*//*YAK Extracted CSS:
:global(.input_Page_m7uBBu) {
  display: block;
}
*/ Page as typeof Page;
