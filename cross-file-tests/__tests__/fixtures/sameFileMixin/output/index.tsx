import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./index.yak.module.css!=!./index?./index.yak.module.css";
var buttonTextMixin = /*#__PURE__*/ css(function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_buttonTextMixin__$disabled_MswrNL");
});
var Button = /*YAK EXPORTED STYLED:Button:index_Button_MswrNL*//*YAK Extracted CSS:
:global(.index_Button_MswrNL) {
  color: black;
}
:global(.index_Button__\$disabled_MswrNL) {
  opacity: 0.5;
}
:global(.index_Button__\$hasIcon_MswrNL) {
  padding-left: 30px;
}
:global(.index_Button__\$disabled_MswrNL-01) {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("index_Button_MswrNL", function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_MswrNL");
}, function(param) {
    var $hasIcon = param.$hasIcon;
    return $hasIcon && /*#__PURE__*/ css("index_Button__$hasIcon_MswrNL");
}, function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_MswrNL-01");
}), {
    "displayName": "Button"
});
export default /*YAK EXPORTED STYLED:default:index_Button_MswrNL*//*YAK Extracted CSS:
:global(.index_Button_MswrNL) {
  color: black;
}
:global(.index_Button__\$disabled_MswrNL) {
  opacity: 0.5;
}
:global(.index_Button__\$hasIcon_MswrNL) {
  padding-left: 30px;
}
:global(.index_Button__\$disabled_MswrNL-01) {
  color: gray;
}
*/ Button;