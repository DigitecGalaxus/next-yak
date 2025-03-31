import { css, styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const textColor = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css(__styleYak.textColor__$active));
const textStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css(__styleYak.textStyles__$active));
export const buttonStyles = /*YAK EXPORTED MIXIN:buttonStyles
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
color: black;
color: red;
*/ /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css(__styleYak.buttonStyles__$active));
export const Button = /*YAK Extracted CSS:
.Button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.Button__ {
  &:hover {
    font-size: 16px;
    color: black;
  }
}
.Button__-and-$active {
  &:hover {
    color: red;
  }
}
.Button {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
.Button__$active {
  &:focus {
    color: red;
  }
}
.Button {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
.Button__$active-01 {
  &:focus {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.Button, ({ $isSet })=>$isSet && true && true && true && /*#__PURE__*/ css(__styleYak.Button__, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak["Button__-and-$active"])), ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.Button__$active), ({ $active })=>$active && /*#__PURE__*/ css(__styleYak["Button__$active-01"])), {
    "displayName": "Button"
});
