import { css, keyframes, __yak_mixin } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const sweep = /*YAK Extracted CSS:
@keyframes :global(sweep_m7uBBu) {
  from {
    background-position: -600px 0;
  }
  to {
    background-position: 600px 0;
  }
}
*/ /*#__PURE__*/ keyframes("sweep_m7uBBu");
// A local keyframe referenced from an exported dynamic mixin (issue #419):
// the @keyframes definition stays in this file's css - the consumer's
// unconditional __yak_use reference keeps this module (and therefore the
// definition) from being tree-shaken away.
export const animated = /*YAK EXPORTED MIXIN V2:animated
animation: global(sweep_m7uBBu) 2s infinite linear;
@yak-branch b0 {
  animation-duration: 0.5s;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        ({ $fast })=>$fast && /*#__PURE__*/ css(__yak_b(0))
    ]);
