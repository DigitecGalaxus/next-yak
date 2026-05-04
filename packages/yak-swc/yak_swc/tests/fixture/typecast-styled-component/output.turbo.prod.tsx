import { styled, css, keyframes } from "next-yak/internal";
// @ts-ignore
import type { DefaultTheme, StyledComponent } from "styled-components";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGZpbGw6IGN1cnJlbnRDb2xvcjsKfUBrZXlmcmFtZXMgeW03dUJCdTIgewogIGZyb20gewogICAgb3BhY2l0eTogMDsKICB9CiAgdG8gewogICAgb3BhY2l0eTogMTsKICB9Cn0ueW03dUJCdTMgewogIGNvbG9yOiByZWQ7CiAgYW5pbWF0aW9uOiB5bTd1QkJ1MiAxcyBsaW5lYXI7Cn0ueW03dUJCdTQgewogIC55bTd1QkJ1IHsKICAgIGNvbG9yOiBibHVlOwogIH0KfQ==";
// styled component wrapped in `as unknown as ...` (e.g. when migrating from styled-components)
export const StyledSvg = /*YAK EXPORTED STYLED:StyledSvg:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
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
@keyframes ym7uBBu2 {
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
.ym7uBBu3 {
  color: red;
  animation: ym7uBBu2 1s linear;
}
*/ /*#__PURE__*/ styled(StyledSvg)("ym7uBBu3") as unknown as StyledComponent<"svg", DefaultTheme, {
}>;
// using the cast styled component as a same-file selector
export const Container = /*YAK EXPORTED STYLED:Container:ym7uBBu4*//*YAK Extracted CSS:
.ym7uBBu4 {
  .ym7uBBu {
    color: blue;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4");
