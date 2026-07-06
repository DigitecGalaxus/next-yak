import { css, styled, __yak_mixin } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const textColor = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu1"));
const textStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu3"));
export const buttonStyles = /*YAK EXPORTED MIXIN V2:buttonStyles
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
color: black;
@yak-branch b0 {
  color: red;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        ({ $active })=>$active && /*#__PURE__*/ css(__yak_b(0))
    ]);
export const Button = /*YAK EXPORTED STYLED:Button:ym7uBBu6*//*YAK Extracted CSS:
:global(.ym7uBBu6) {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.ym7uBBu7) {
  &:hover {
    font-size: 16px;
    color: black;
  }
}
:global(.ym7uBBu8) {
  &:hover {
    color: red;
  }
}
:global(.ym7uBBu6) {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
:global(.ym7uBBu9) {
  &:focus {
    color: red;
  }
}
:global(.ym7uBBu6) {
  &:focus {
    font-size: 16px;
    color: black;
  }
}
:global(.ym7uBBuA) {
  &:focus {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu6", ({ $isSet })=>$isSet && true && true && true && /*#__PURE__*/ css("ym7uBBu7", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu8")), ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu9"), ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuA"));
