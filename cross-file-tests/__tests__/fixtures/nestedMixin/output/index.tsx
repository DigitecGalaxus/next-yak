import { styled } from "next-yak/internal";
import { buttonMixin } from './mixin';
import { primaryButtonMixin } from './helper/anotherMixin';
import * as __yak from "next-yak/internal";
import "./index.yak.module.css!=!./index?./index.yak.module.css";
export var Button = /*YAK EXPORTED STYLED:Button:index_Button_yv8GUO*//*YAK Extracted CSS:
:global(.index_Button_yv8GUO) {
  --yak-css-import: url("./mixin:buttonMixin",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("index_Button_yv8GUO"), {
    "displayName": "Button"
});
export var PrimaryButton = /*YAK EXPORTED STYLED:PrimaryButton:index_PrimaryButton_yv8GUO*//*YAK Extracted CSS:
:global(.index_PrimaryButton_yv8GUO) {
  --yak-css-import: url("./helper/anotherMixin:primaryButtonMixin",mixin);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Button)("index_PrimaryButton_yv8GUO"), {
    "displayName": "PrimaryButton"
});