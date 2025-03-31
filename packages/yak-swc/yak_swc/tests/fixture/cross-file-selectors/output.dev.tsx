import { styled } from "next-yak/internal";
// @ts-ignore
import { Icon } from "./Icon";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const primary = "green";
export const Button = /*YAK Extracted CSS:
.Button {
  font-size: 1rem;
  color: green;
  --yak-css-import: url("./Icon:Icon",selector) {
    color: red;
  }
  --yak-css-import: url("./Icon:Icon",selector) --yak-css-import: url("./Icon:Icon",selector) {
    color: blue;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.Button), {
    "displayName": "Button"
});
