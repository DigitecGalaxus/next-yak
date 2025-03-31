import { styled } from "next-yak/internal";
import { IconButton } from "./iconButton";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FancyIconButton = /*YAK Extracted CSS:
.FancyIconButton {
  color: hotpink;
  &:before {
    content: "FancyIconButton";
  }
  --yak-css-import: url("./iconButton:IconButton",selector) {
    color: #f0f;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(IconButton)(__styleYak.FancyIconButton), {
    "displayName": "FancyIconButton"
});
