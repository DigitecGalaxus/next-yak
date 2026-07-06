import { css, styled, __yak_use, __yak_mixin } from "next-yak/internal";
import { typographyMixin } from "./typography";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const textColor = /*#__PURE__*/ css();
const textStyles = /*#__PURE__*/ css();
export const buttonStyles = /*YAK EXPORTED MIXIN V2:buttonStyles
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
color: black;
--yak-css-import: url("./typography:typographyMixin",mixin,@s0);
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        __yak_use(typographyMixin, __yak_b.sub(0))
    ]);
export const Button = /*YAK EXPORTED STYLED:Button:ym7uBBu4*//*YAK Extracted CSS:
:global(.ym7uBBu4) {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.ym7uBBu5) {
  &:hover {
    font-size: 16px;
    color: black;
  }
}
:global(.ym7uBBu4) {
  &:focus {
    font-size: 16px;
    color: black;
    font-size: 16px;
    color: black;
  }
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu4", ({ $isSet })=>$isSet && true && true && true && /*#__PURE__*/ css("ym7uBBu5"));
export const aspectRatios = {
    base: /*YAK EXPORTED MIXIN:aspectRatios:base
padding-top: 100%;
*/ /*#__PURE__*/ css(),
    "16:9": /*YAK EXPORTED MIXIN:aspectRatios:16%3A9
padding-top: 56.25%;
*/ /*#__PURE__*/ css(),
    "4:3": /*YAK EXPORTED MIXIN:aspectRatios:4%3A3
padding-top: 75%;
*/ /*#__PURE__*/ css()
};
