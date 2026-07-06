import { css, __yak_mixin } from "next-yak/internal";
// The simplest dynamic mixin: one static part, one conditional branch.
// Exporting it must compile it to a class-name-parameterized template
// (a V2 payload comment + __yak_mixin factory) instead of erroring.
export const highlight = /*YAK EXPORTED MIXIN V2:highlight
color: black;
@yak-branch b0 {
  color: red;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        ({ $active })=>$active && /*#__PURE__*/ css(__yak_b(0))
    ]);
