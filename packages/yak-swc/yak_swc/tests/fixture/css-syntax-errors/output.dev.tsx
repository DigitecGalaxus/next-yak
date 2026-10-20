import { styled, css } from "@yak/react/internal";
import * as __yak from "@yak/react/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const EmptySelector = /*YAK EXPORTED STYLED:EmptySelector:input_EmptySelector_m7uBBu*//*YAK Extracted CSS:
:global(.input_EmptySelector_m7uBBu) {
  color: red;
   {
    color: blue;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_EmptySelector_m7uBBu"), {
    "displayName": "EmptySelector"
});
export const DynamicSelector = /*YAK EXPORTED STYLED:DynamicSelector:input_DynamicSelector_m7uBBu*//*YAK Extracted CSS:
:global(.input_DynamicSelector_m7uBBu) {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DynamicSelector_m7uBBu", (p)=>p.$selector), {
    "displayName": "DynamicSelector"
});
const media = {
    up: (width: string)=>`@media (min-width: ${width})`
};
export const DynamicMediaQuery = /*YAK EXPORTED STYLED:DynamicMediaQuery:input_DynamicMediaQuery_m7uBBu*//*YAK Extracted CSS:
:global(.input_DynamicMediaQuery_m7uBBu) {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DynamicMediaQuery_m7uBBu", media.up("768px")), {
    "displayName": "DynamicMediaQuery"
});
const desktop = "@media (min-width: 768px)";
export const ConstantMediaQuery = /*YAK EXPORTED STYLED:ConstantMediaQuery:input_ConstantMediaQuery_m7uBBu*//*YAK Extracted CSS:
:global(.input_ConstantMediaQuery_m7uBBu) {
  @media (min-width: 768px) {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ConstantMediaQuery_m7uBBu"), {
    "displayName": "ConstantMediaQuery"
});
export const MissingColon = /*YAK EXPORTED STYLED:MissingColon:input_MissingColon_m7uBBu*//*YAK Extracted CSS:
:global(.input_MissingColon_m7uBBu) {
  color red: ;
  .foo {
    margin 0 : ;
  }
  padding: 0;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MissingColon_m7uBBu"), {
    "displayName": "MissingColon"
});
export const missingColonAtEnd = /*YAK EXPORTED MIXIN:missingColonAtEnd
padding: 0;
color red: ;
*/ /*#__PURE__*/ css();
export const AtRules = /*YAK EXPORTED STYLED:AtRules:input_AtRules_m7uBBu*//*YAK Extracted CSS:
:global(.input_AtRules_m7uBBu) {
  @media (min-width: 640px) {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_AtRules_m7uBBu"), {
    "displayName": "AtRules"
});
