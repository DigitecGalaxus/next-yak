import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// example taken from https://github.com/jantimon/next-yak/issues/208 
const spacing = "20px";
const ContainerFluid = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  position: relative;
  margin: 0 auto;
  padding-top: 20px;
  max-width: 100%;
}
:global(.ym7uBBu1) {
  margin-top: unset;
}
:global(.ym7uBBu2) {
  margin-top: px;
}
:global(.ym7uBBu) {
  margin-top: var(--ym7uBBu3);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", ({ $isApp, $pageHeaderHeight })=>$isApp ? /*#__PURE__*/ css("ym7uBBu1") : /*#__PURE__*/ css("ym7uBBu2"), {
    "style": {
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $pageHeaderHeight })=>$pageHeaderHeight, "px")
    }
});
