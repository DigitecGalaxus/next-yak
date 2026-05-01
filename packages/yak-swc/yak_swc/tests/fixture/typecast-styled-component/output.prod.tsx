import { styled, css, keyframes } from "next-yak/internal";
// @ts-ignore
import type { DefaultTheme, StyledComponent } from "styled-components";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// styled component wrapped in `as unknown as ...` (e.g. when migrating from styled-components)
export const StyledSvg = /*YAK EXPORTED STYLED:StyledSvg:ym7uBBu*//*YAK Extracted CSS:
:global(.ym7uBBu) {
  fill: currentColor;
}
*/ /*#__PURE__*/ __yak.__yak_svg("ym7uBBu") as unknown as StyledComponent<"svg", DefaultTheme, {
}> & {
    __yak: true;
};
// css mixin wrapped in a type assertion
export const highlight = /*YAK EXPORTED MIXIN:highlight
color: red;
*/ /*#__PURE__*/ css() as unknown as ReturnType<typeof css>;
// keyframes wrapped in a type assertion
export const fade = /*YAK Extracted CSS:
@keyframes :global(ym7uBBu2) {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu2") as unknown as ReturnType<typeof keyframes>;
// styled component wrapping another styled component, both with casts
export const PrimaryButton = /*YAK EXPORTED STYLED:PrimaryButton:ym7uBBu3*//*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: red;
  animation: global(ym7uBBu2) 1s linear;
}
*/ /*#__PURE__*/ styled(StyledSvg)("ym7uBBu3") as unknown as StyledComponent<"svg", DefaultTheme, {
}>;
// using the cast styled component as a same-file selector
export const Container = /*YAK EXPORTED STYLED:Container:ym7uBBu4*//*YAK Extracted CSS:
:global(.ym7uBBu4) {
  :global(.ym7uBBu) {
    color: blue;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4");
