import { styled, css } from "@yak/react/internal";
import * as __yak from "@yak/react/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const EmptySelector = /*YAK EXPORTED STYLED:EmptySelector:ym7uBBu*//*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
   {
    color: blue;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
export const DynamicSelector = /*YAK EXPORTED STYLED:DynamicSelector:ym7uBBu1*//*YAK Extracted CSS:
:global(.ym7uBBu1) {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1", (p)=>p.$selector);
const media = {
    up: (width: string)=>`@media (min-width: ${width})`
};
export const DynamicMediaQuery = /*YAK EXPORTED STYLED:DynamicMediaQuery:ym7uBBu2*//*YAK Extracted CSS:
:global(.ym7uBBu2) {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu2", media.up("768px"));
const desktop = "@media (min-width: 768px)";
export const ConstantMediaQuery = /*YAK EXPORTED STYLED:ConstantMediaQuery:ym7uBBu3*//*YAK Extracted CSS:
:global(.ym7uBBu3) {
  @media (min-width: 768px) {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3");
export const MissingColon = /*YAK EXPORTED STYLED:MissingColon:ym7uBBu4*//*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color red: ;
  .foo {
    margin 0 : ;
  }
  padding: 0;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4");
export const missingColonAtEnd = /*YAK EXPORTED MIXIN:missingColonAtEnd
padding: 0;
color red: ;
*/ /*#__PURE__*/ css();
export const AtRules = /*YAK EXPORTED STYLED:AtRules:ym7uBBu6*//*YAK Extracted CSS:
:global(.ym7uBBu6) {
  @media (min-width: 640px) {
    color: red;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu6");
