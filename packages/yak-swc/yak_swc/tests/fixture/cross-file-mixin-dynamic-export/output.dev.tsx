import { css, styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const textColor = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_textColor__$active_m7uBBu"));
const textStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_textStyles__$active_m7uBBu"));
export const buttonStyles = /*YAK EXPORTED MIXIN:buttonStyles
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
color: black;
color: red;
*/ /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_buttonStyles__$active_m7uBBu"));
export const Button = /*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.input_Button___m7uBBu) {
  &:hover {
    font-size: 16px;
    color: black;
  }
}
:global(.input_Button__-and-$active_m7uBBu) {
  &:hover {
    color: red;
  }
}
:global(.input_Button_m7uBBu) {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
:global(.input_Button__$active_m7uBBu) {
  &:focus {
    color: red;
  }
}
:global(.input_Button_m7uBBu) {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
:global(.input_Button__$active_m7uBBu-01) {
  &:focus {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu", ({ $isSet })=>$isSet && true && true && true && /*#__PURE__*/ css("input_Button___m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_Button__-and-$active_m7uBBu")), ({ $active })=>$active && /*#__PURE__*/ css("input_Button__$active_m7uBBu"), ({ $active })=>$active && /*#__PURE__*/ css("input_Button__$active_m7uBBu-01")), {
    "displayName": "Button"
});
