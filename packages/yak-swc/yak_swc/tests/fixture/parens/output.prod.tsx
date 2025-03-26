import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Card = /*YAK Extracted CSS:
.Card {
  background: url("/card-bg.jpg") no-repeat;
}
.Card__$active {
  backgorund: url(/card-bg-active.jpg) no-repeat;
}
.Card {
  transform: translate(-50%, -50%) rotate(var(--ym7uBBu))
translate(0, -88px) rotate(var(--ym7uBBu1));
}
*/ /*#__PURE__*/ __yak.__yak_div(__styleYak.Card, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.Card__$active), {
    "style": {
        "--ym7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--ym7uBBu1": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
});
