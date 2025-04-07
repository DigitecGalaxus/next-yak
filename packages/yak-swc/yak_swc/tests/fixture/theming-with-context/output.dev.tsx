import React from 'react';
import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const ThemedComponent = /*YAK Extracted CSS:
:global(.input_ThemedComponent_m7uBBu) {
  background-color: var(--input_ThemedComponent__background-color_m7uBBu);
  color: var(--input_ThemedComponent__color_m7uBBu);
  padding: 20px;
  border-radius: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ThemedComponent_m7uBBu", {
    "style": {
        "--input_ThemedComponent__background-color_m7uBBu": (props)=>props.theme.background,
        "--input_ThemedComponent__color_m7uBBu": (props)=>props.theme.text
    }
}), {
    "displayName": "ThemedComponent"
});
