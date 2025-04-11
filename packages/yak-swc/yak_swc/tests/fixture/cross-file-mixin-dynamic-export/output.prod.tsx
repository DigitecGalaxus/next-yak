import { css, styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const textColor = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu1"));
const textStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu3"));
export const buttonStyles = /*YAK EXPORTED MIXIN:buttonStyles
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
color: black;
color: red;
*/ /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu5"));
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
