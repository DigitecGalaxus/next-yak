import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Card = /*YAK Extracted CSS:
:global(.Card_m7uBBu) {
  background: url("/card-bg.jpg") no-repeat;
}
:global(.Card__$active_m7uBBu) {
  backgorund: url(/card-bg-active.jpg) no-repeat;
}
:global(.Card_m7uBBu) {
  transform: translate(-50%, -50%) rotate(var(--Card__transform_m7uBBu))
translate(0, -88px) rotate(var(--Card__transform_m7uBBu-01));
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("Card_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("Card__$active_m7uBBu"), {
    "style": {
        "--Card__transform_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--Card__transform_m7uBBu-01": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
}), {
    "displayName": "Card"
});
