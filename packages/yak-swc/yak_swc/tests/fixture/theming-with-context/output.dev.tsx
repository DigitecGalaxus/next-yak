import React from 'react';
import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const ThemedComponent = /*YAK Extracted CSS:
.ThemedComponent {
  background-color: var(--ThemedComponent__background-color_m7uBBu);
  color: var(--ThemedComponent__color_m7uBBu);
  padding: 20px;
  border-radius: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div(__styleYak.ThemedComponent, {
    "style": {
        "--ThemedComponent__background-color_m7uBBu": (props)=>props.theme.background,
        "--ThemedComponent__color_m7uBBu": (props)=>props.theme.text
    }
}), {
    "displayName": "ThemedComponent"
});
