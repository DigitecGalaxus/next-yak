import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// example taken from https://github.com/jantimon/next-yak/issues/208 
const spacing = "20px";
const ContainerFluid = /*YAK Extracted CSS:
:global(.input_ContainerFluid_m7uBBu) {
  position: relative;
  margin: 0 auto;
  padding-top: 20px;
  max-width: 100%;
}
:global(.input_ContainerFluid__\$isApp_m7uBBu) {
  margin-top: unset;
}
:global(.input_ContainerFluid__not_\$isApp_m7uBBu) {
  margin-top: px;
}
:global(.input_ContainerFluid_m7uBBu) {
  margin-top: var(--input_ContainerFluid__margin-top_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ContainerFluid_m7uBBu", ({ $isApp, $pageHeaderHeight })=>$isApp ? /*#__PURE__*/ css("input_ContainerFluid__$isApp_m7uBBu") : /*#__PURE__*/ css("input_ContainerFluid__not_$isApp_m7uBBu"), {
    "style": {
        "--input_ContainerFluid__margin-top_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $pageHeaderHeight })=>$pageHeaderHeight, "px")
    }
}), {
    "displayName": "ContainerFluid"
});
