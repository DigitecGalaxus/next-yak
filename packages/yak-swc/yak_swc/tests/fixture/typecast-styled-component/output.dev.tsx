import { styled, css, keyframes } from "next-yak/internal";
// @ts-ignore
import type { DefaultTheme, StyledComponent } from "styled-components";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// styled component wrapped in `as unknown as ...` (e.g. when migrating from styled-components)
export const StyledSvg = /*YAK EXPORTED STYLED:StyledSvg:input_StyledSvg_m7uBBu*//*YAK Extracted CSS:
:global(.input_StyledSvg_m7uBBu) {
  fill: currentColor;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_svg("input_StyledSvg_m7uBBu"), {
    "displayName": "StyledSvg"
}) as unknown as StyledComponent<"svg", DefaultTheme, {
}> & {
    __yak: true;
};
// css mixin wrapped in a type assertion
export const highlight = /*YAK EXPORTED MIXIN:highlight
color: red;
*/ /*#__PURE__*/ css() as unknown as ReturnType<typeof css>;
// keyframes wrapped in a type assertion
export const fade = /*YAK Extracted CSS:
@keyframes :global(fade_m7uBBu) {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("fade_m7uBBu") as unknown as ReturnType<typeof keyframes>;
// styled component wrapping another styled component, both with casts
export const PrimaryButton = /*YAK EXPORTED STYLED:PrimaryButton:input_PrimaryButton_m7uBBu*//*YAK Extracted CSS:
:global(.input_PrimaryButton_m7uBBu) {
  color: red;
  animation: global(fade_m7uBBu) 1s linear;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(StyledSvg)("input_PrimaryButton_m7uBBu"), {
    "displayName": "PrimaryButton"
}) as unknown as StyledComponent<"svg", DefaultTheme, {
}>;
// using the cast styled component as a same-file selector
export const Container = /*YAK EXPORTED STYLED:Container:input_Container_m7uBBu*//*YAK Extracted CSS:
:global(.input_Container_m7uBBu) {
  :global(.input_StyledSvg_m7uBBu) {
    color: blue;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Container_m7uBBu"), {
    "displayName": "Container"
});
