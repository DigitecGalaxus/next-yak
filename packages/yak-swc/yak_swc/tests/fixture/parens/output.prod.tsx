import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Card = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  background: url("/card-bg.jpg") no-repeat;
}
:global(.ym7uBBu1) {
  backgorund: url(/card-bg-active.jpg) no-repeat;
}
:global(.ym7uBBu) {
  transform: translate(-50%, -50%) rotate(var(--ym7uBBu2))
translate(0, -88px) rotate(var(--ym7uBBu3));
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu1"), {
    "style": {
        "--ym7uBBu2": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
});
