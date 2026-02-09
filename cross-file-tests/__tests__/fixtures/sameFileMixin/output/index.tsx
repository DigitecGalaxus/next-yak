import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./index.yak.module.css!=!./index?./index.yak.module.css";
var buttonTextMixin = /*#__PURE__*/ css(function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_buttonTextMixin__$disabled_BUlQeq");
});
var Button = /*YAK EXPORTED STYLED:Button:index_Button_BUlQeq*//*YAK Extracted CSS:
:global(.index_Button_BUlQeq) {
  color: black;
}
:global(.index_Button__\$disabled_BUlQeq) {
  opacity: 0.5;
}
:global(.index_Button__\$hasIcon_BUlQeq) {
  padding-left: 30px;
}
:global(.index_Button__\$disabled_BUlQeq-01) {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("index_Button_BUlQeq", function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_BUlQeq");
}, function(param) {
    var $hasIcon = param.$hasIcon;
    return $hasIcon && /*#__PURE__*/ css("index_Button__$hasIcon_BUlQeq");
}, function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_BUlQeq-01");
}), {
    "displayName": "Button"
});
export default /*YAK EXPORTED STYLED:default:index_Button_BUlQeq*//*YAK Extracted CSS:
:global(.index_Button_BUlQeq) {
  color: black;
}
:global(.index_Button__\$disabled_BUlQeq) {
  opacity: 0.5;
}
:global(.index_Button__\$hasIcon_BUlQeq) {
  padding-left: 30px;
}
:global(.index_Button__\$disabled_BUlQeq-01) {
  color: gray;
}
*/ Button;