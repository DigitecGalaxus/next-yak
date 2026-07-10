import { globalStyle, keyframes } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const fadeIn = /*YAK Extracted CSS:
@keyframes :global(fadeIn_m7uBBu) {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("fadeIn_m7uBBu");
/*YAK Extracted CSS:
::view-transition-new(root) {
  animation: global(fadeIn_m7uBBu) 200ms ease;
}
*/ /*#__PURE__*/ globalStyle();
