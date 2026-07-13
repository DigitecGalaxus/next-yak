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
:global(.ym7uBBu) {
  width: 32px;
  margin: 24px;
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
// Selector reference wrapped in a cast inside a CSS interpolation
const Box = /*#__PURE__*/ __yak.__yak_div("ym7uBBu1");
const B = /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  :global(.ym7uBBu1) {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu2");
// Constant lookup through a non-null assertion
const COLOR = "blue";
const C = /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3");
// Default export through a TS cast
const Page = /*YAK EXPORTED STYLED:Page:ym7uBBu4*//*YAK Extracted CSS:
:global(.ym7uBBu4) {
  display: block;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4");
export default /*YAK EXPORTED STYLED:default:ym7uBBu4*//*YAK Extracted CSS:
:global(.ym7uBBu4) {
  display: block;
}
*/ Page as typeof Page;
