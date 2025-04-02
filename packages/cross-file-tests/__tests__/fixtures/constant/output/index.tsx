import { styled, css } from "next-yak/internal";
import { colors, negative, siteMaxWidth } from "./constants";
import * as __yak from "next-yak/internal";
import "./index.yak.module.css!=!./index?./index.yak.module.css";
export var Button = /*YAK Extracted CSS:
:global(.index_Button_wIxfWW) {
  color: red;
  height: --yak-css-import: url("./constants:siteMaxWidth",mixin)px;
  color: --yak-css-import: url("./constants:colors:primary",mixin);
  background-color: --yak-css-import: url("./constants:colors:secondary",mixin);
  z-index: --yak-css-import: url("./constants:negative",mixin);
}
:global(.index_Button___wIxfWW) {
  color: --yak-css-import: url("./constants:colors:secondary",mixin);
  background-color: --yak-css-import: url("./constants:colors:primary",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("index_Button_wIxfWW", function(param) {
    var $variant = param.$variant;
    return $variant === "secondary" && /*#__PURE__*/ css("index_Button___wIxfWW");
}), {
    "displayName": "Button"
});