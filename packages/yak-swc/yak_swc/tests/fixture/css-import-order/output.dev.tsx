import { styled } from "next-yak/internal";
import { IconButton } from "./iconButton";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FancyIconButton = /*YAK Extracted CSS:
:global(.input_FancyIconButton_m7uBBu) {
  color: hotpink;
  &:before {
    content: "FancyIconButton";
  }
  --yak-css-import: url("./iconButton:IconButton",selector) {
    color: #f0f;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(IconButton)("input_FancyIconButton_m7uBBu"), {
    "displayName": "FancyIconButton"
});
