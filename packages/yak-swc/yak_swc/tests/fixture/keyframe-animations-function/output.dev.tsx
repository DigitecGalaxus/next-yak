import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FadeInText = /*YAK Extracted CSS:
.FadeInText__$reverse {
  animation: fadeOut 1s ease-in;
}
.FadeInText__not_$reverse {
  animation: fadeIn 1s ease-in;
}
.FadeInText {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p(__styleYak.FadeInText, ({ $reverse })=>$reverse ? /*#__PURE__*/ css(__styleYak.FadeInText__$reverse) : /*#__PURE__*/ css(__styleYak.FadeInText__not_$reverse)), {
    "displayName": "FadeInText"
});
const fadeIn = /*YAK Extracted CSS:
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.fadeIn);
const fadeOut = /*YAK Extracted CSS:
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.fadeOut);
