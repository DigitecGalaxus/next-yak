import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./index.yak.module.css!=!./index?./index.yak.module.css";
var buttonTextMixin = /*#__PURE__*/ css(function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css(__styleYak.buttonTextMixin__$disabled);
});
var Button = /*YAK Extracted CSS:
.Button {
  color: black;
}
.Button__$disabled {
  opacity: 0.5;
}
.Button__$hasIcon {
  padding-left: 30px;
}
.Button__$disabled-01 {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.Button, function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css(__styleYak.Button__$disabled);
}, function(param) {
    var $hasIcon = param.$hasIcon;
    return $hasIcon && /*#__PURE__*/ css(__styleYak.Button__$hasIcon);
}, function(param) {
    var $disabled = param.$disabled;
    return $disabled && /*#__PURE__*/ css(__styleYak["Button__$disabled-01"]);
}), {
    "displayName": "Button"
});
export default Button;