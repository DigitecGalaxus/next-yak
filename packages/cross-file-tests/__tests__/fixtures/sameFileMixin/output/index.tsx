import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./index.yak.module.css!=!./index?./index.yak.module.css";
var buttonTextMixin = /*#__PURE__*/ css(function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_buttonTextMixin__$disabled_xEUJ1U");
});
var Button = /*YAK Extracted CSS:
:global(.index_Button_xEUJ1U) {
  color: black;
}
:global(.index_Button__\$disabled_xEUJ1U) {
  opacity: 0.5;
}
:global(.index_Button__\$hasIcon_xEUJ1U) {
  padding-left: 30px;
}
:global(.index_Button__\$disabled_xEUJ1U-01) {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("index_Button_xEUJ1U", function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_xEUJ1U");
}, function(param) {
    var $hasIcon = param.$hasIcon;
    return $hasIcon && /*#__PURE__*/ css("index_Button__$hasIcon_xEUJ1U");
}, function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css("index_Button__$disabled_xEUJ1U-01");
}), {
    "displayName": "Button"
});
export default Button;