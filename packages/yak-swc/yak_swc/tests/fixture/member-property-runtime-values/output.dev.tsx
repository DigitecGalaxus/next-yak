import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const SIZES: Record<"sm" | "md", {
    width: string;
    height: string;
}> = {
    sm: {
        width: '24px',
        height: '24px'
    },
    md: {
        width: '32px',
        height: '32px'
    }
};
const StyledDiv = /*YAK Extracted CSS:
:global(.input_StyledDiv_m7uBBu) {
  width: var(--input_StyledDiv__width_m7uBBu);
  height: 24px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_StyledDiv_m7uBBu", {
    "style": {
        "--input_StyledDiv__width_m7uBBu": ({ $size })=>SIZES[$size].width
    }
}), {
    "displayName": "StyledDiv"
});
const StyledButton = /*YAK Extracted CSS:
:global(.input_StyledButton__\$active_m7uBBu) {
  width: var(--input_StyledButton__width_m7uBBu);
  height: 32px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_StyledButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_StyledButton__$active_m7uBBu", {
        "style": {
            "--input_StyledButton__width_m7uBBu": ({ $size })=>SIZES[$size].width
        }
    })), {
    "displayName": "StyledButton"
});
