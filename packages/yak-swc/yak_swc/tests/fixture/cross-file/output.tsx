import { styled } from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
// @ts-ignore
import { Icon } from "./Icon";
const primary = "green";
export const Button = /*YAK Extracted CSS:
.Button {
  font-size: 1rem;
  color: green;
  :module-selector-import(Icon from './Icon') {
    color: red;
  }
}
*/ /*#__PURE__*/ styled.button(__styleYak["Button"]);