import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIHBvc2l0aW9uOiByZWxhdGl2ZTsKICBtYXJnaW46IDAgYXV0bzsKICBwYWRkaW5nLXRvcDogMjBweDsKICBtYXgtd2lkdGg6IDEwMCU7Cn0KLnltN3VCQnUxIHsKICBtYXJnaW4tdG9wOiB1bnNldDsKfQoueW03dUJCdTIgewogIG1hcmdpbi10b3A6IHB4Owp9Ci55bTd1QkJ1IHsKICBtYXJnaW4tdG9wOiB2YXIoLS15bTd1QkJ1Myk7Cn0=";
// example taken from https://github.com/jantimon/next-yak/issues/208 
const spacing = "20px";
const ContainerFluid = /*YAK Extracted CSS:
.ym7uBBu {
  position: relative;
  margin: 0 auto;
  padding-top: 20px;
  max-width: 100%;
}
.ym7uBBu1 {
  margin-top: unset;
}
.ym7uBBu2 {
  margin-top: px;
}
.ym7uBBu {
  margin-top: var(--ym7uBBu3);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", ({ $isApp, $pageHeaderHeight })=>$isApp ? /*#__PURE__*/ css("ym7uBBu1") : /*#__PURE__*/ css("ym7uBBu2"), {
    "style": {
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $pageHeaderHeight })=>$pageHeaderHeight, "px")
    }
});
