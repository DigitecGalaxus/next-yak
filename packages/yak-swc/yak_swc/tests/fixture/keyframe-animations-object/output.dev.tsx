import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FadeInText = /*YAK Extracted CSS:
.FadeInText__$reverse {
  animation: animations_fadeOut 1s ease-in;
}
.FadeInText__not_$reverse {
  animation: animations_fadeIn 1s ease-in;
}
.FadeInText {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p(__styleYak.FadeInText, ({ $reverse })=>$reverse ? /*#__PURE__*/ css(__styleYak.FadeInText__$reverse) : /*#__PURE__*/ css(__styleYak.FadeInText__not_$reverse)), {
    "displayName": "FadeInText"
});
const animations = {
    fadeIn: /*YAK Extracted CSS:
@keyframes animations_fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.animations_fadeIn),
    fadeOut: /*YAK Extracted CSS:
@keyframes animations_fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.animations_fadeOut)
};
const slides = {
    200: /*YAK Extracted CSS:
@keyframes slides_200 {
  to {
    transform: translate(200px, 200px);
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.slides_200),
    "x400": /*YAK Extracted CSS:
@keyframes slides_x400 {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(400px);
  }
}
*/ /*#__PURE__*/ keyframes(__styleYak.slides_x400)
};
export const FancyButton = /*YAK Extracted CSS:
.FancyButton {
  background-color: #f00;
  animation: slides_x400 1s ease-in-out, animations_fadeIn 1s ease-in;
  &:hover {
    animation: slides_200 1s ease-in-out, animations_fadeOut 1s ease-in;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.FancyButton), {
    "displayName": "FancyButton"
});
