import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FadeInText = /*YAK EXPORTED STYLED:FadeInText:ym7uBBu*//*YAK Extracted CSS:
:global(.ym7uBBu1) {
  animation: ym7uBBu2 1s ease-in;
}
:global(.ym7uBBu3) {
  animation: ym7uBBu4 1s ease-in;
}
:global(.ym7uBBu) {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu", ({ $reverse })=>$reverse ? /*#__PURE__*/ css("ym7uBBu1") : /*#__PURE__*/ css("ym7uBBu3"));
const animations = {
    fadeIn: /*YAK Extracted CSS:
@keyframes :global(ym7uBBu4) {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu4"),
    fadeOut: /*YAK Extracted CSS:
@keyframes :global(ym7uBBu2) {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu2")
};
const slides = {
    200: /*YAK Extracted CSS:
@keyframes :global(ym7uBBu5) {
  to {
    transform: translate(200px, 200px);
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu5"),
    "x400": /*YAK Extracted CSS:
@keyframes :global(ym7uBBu6) {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(400px);
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu6")
};
export const FancyButton = /*YAK EXPORTED STYLED:FancyButton:ym7uBBu7*//*YAK Extracted CSS:
:global(.ym7uBBu7) {
  background-color: #f00;
  animation: global(ym7uBBu6) 1s ease-in-out, global(ym7uBBu4) 1s ease-in;
  &:hover {
    animation: global(ym7uBBu5) 1s ease-in-out, global(ym7uBBu2) 1s ease-in;
  }
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu7");
