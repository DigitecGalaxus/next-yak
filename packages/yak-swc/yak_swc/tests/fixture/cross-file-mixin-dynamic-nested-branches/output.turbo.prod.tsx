import { css, __yak_mixin } from "next-yak/internal";
// Exported dynamic mixin with a nested branch (branch inside branch) and a
// nested selector context inside the outer branch. Each branch gets its own
// @yak-branch block in the payload; the runtime template chains the
// conditions so the inner branch only toggles when the outer one matched.
export const fancy = /*YAK EXPORTED MIXIN V2:fancy
color: black;
@yak-branch b0 {
  color: red;
  &:hover {
    color: darkred;
  }
}
@yak-branch b1 {
  color: blue;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        ({ $a })=>$a && /*#__PURE__*/ css(__yak_b(0), ({ $b })=>$b && /*#__PURE__*/ css(__yak_b(1)))
    ]);
