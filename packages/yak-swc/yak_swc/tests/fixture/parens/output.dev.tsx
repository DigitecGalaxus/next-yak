import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Card = /*YAK Extracted CSS:
:global(.input_Card_m7uBBu) {
  background: url("/card-bg.jpg") no-repeat;
}
:global(.input_Card__\$active_m7uBBu) {
  backgorund: url(/card-bg-active.jpg) no-repeat;
}
:global(.input_Card_m7uBBu) {
  transform: translate(-50%, -50%) rotate(var(--input_Card__transform_m7uBBu))
translate(0, -88px) rotate(var(--input_Card__transform_m7uBBu-01));
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_Card__$active_m7uBBu"), {
    "style": {
        "--input_Card__transform_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--input_Card__transform_m7uBBu-01": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
}), {
    "displayName": "Card"
});
