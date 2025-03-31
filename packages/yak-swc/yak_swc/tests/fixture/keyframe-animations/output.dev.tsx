import { styled, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
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
export const FadeInText = /*YAK Extracted CSS:
.FadeInText {
  animation: fadeIn 1s ease-in;
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p(__styleYak.FadeInText), {
    "displayName": "FadeInText"
});
