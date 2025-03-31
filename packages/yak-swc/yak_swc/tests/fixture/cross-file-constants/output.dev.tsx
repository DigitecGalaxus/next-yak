import { styled } from "next-yak/internal";
// @ts-ignore
import { colors } from "./colorDefinitions";
// @ts-ignore
import { fonts } from "./fontDefinitions";
// @ts-ignore
import { sizes } from "./sizeDefinitions";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Button = /*YAK Extracted CSS:
.Button {
  font-size: --yak-css-import: url("./fontDefinitions:fonts:sm",mixin);
  color: --yak-css-import: url("./colorDefinitions:colors:dark:primary",mixin);
  border-color: --yak-css-import: url("./colorDefinitions:colors:shadows:dark:primary",mixin);
  background-color: --yak-css-import: url("./colorDefinitions:colors:light:full%20opacity",mixin);
  height: --yak-css-import: url("./sizeDefinitions:sizes:0",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.Button), {
    "displayName": "Button"
});
