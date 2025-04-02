import { styled } from "next-yak/internal";
import { buttonMixin } from './mixin';
import { primaryButtonMixin } from './helper/anotherMixin';
import * as __yak from "next-yak/internal";
import __styleYak from "./index.yak.module.css!=!./index?./index.yak.module.css";
export var Button = /*YAK Extracted CSS:
.Button {
  --yak-css-import: url("./mixin:buttonMixin",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.Button), {
    "displayName": "Button"
});
export var PrimaryButton = /*YAK Extracted CSS:
.PrimaryButton {
  --yak-css-import: url("./helper/anotherMixin:primaryButtonMixin",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Button)(__styleYak.PrimaryButton), {
    "displayName": "PrimaryButton"
});