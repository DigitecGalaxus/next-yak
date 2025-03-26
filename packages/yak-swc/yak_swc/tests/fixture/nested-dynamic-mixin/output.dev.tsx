import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
// example taken from https://github.com/jantimon/next-yak/issues/208 
const spacing = "20px";
const ContainerFluid = /*YAK Extracted CSS:
.ContainerFluid {
  position: relative;
  margin: 0 auto;
  padding-top: 20px;
  max-width: 100%;
}
.ContainerFluid__$isApp {
  margin-top: unset;
}
.ContainerFluid__not_$isApp {
  margin-top: px;
}
.ContainerFluid {
  margin-top: var(--ContainerFluid__margin-top_m7uBBu);
}
*/ /*#__PURE__*/ __yak.__yak_div(__styleYak.ContainerFluid, ({ $isApp, $pageHeaderHeight })=>$isApp ? /*#__PURE__*/ css(__styleYak.ContainerFluid__$isApp) : /*#__PURE__*/ css(__styleYak.ContainerFluid__not_$isApp), {
    "style": {
        "--ContainerFluid__margin-top_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $pageHeaderHeight })=>$pageHeaderHeight, "px")
    }
});
