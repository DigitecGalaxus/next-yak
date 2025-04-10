import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_buttonStyles__$active_m7uBBu", {
        "style": {
            "--input_buttonStyles__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_buttonStyles__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK Extracted CSS:
:global(.input_ThemedButton_m7uBBu) {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.input_ThemedButton__\$active_m7uBBu) {
  @media (max-width: 600px) {
    background-color: #f0f0f0;
    max-width: var(--input_ThemedButton__max-width_m7uBBu);
  }
}
:global(.input_ThemedButton_m7uBBu) {
  width: var(--input_ThemedButton__width_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_ThemedButton__$active_m7uBBu", {
        "style": {
            "--input_ThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_ThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "ThemedButton"
});
export const CustomThemedButton = /*YAK Extracted CSS:
:global(.input_CustomThemedButton_m7uBBu) {
  color: red;
  &:not([disabled]) {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
}
:global(.input_CustomThemedButton__\$active_m7uBBu) {
  &:not([disabled]) {
    @media (max-width: 600px) {
      background-color: #f0f0f0;
      max-width: var(--input_CustomThemedButton__max-width_m7uBBu);
    }
  }
}
:global(.input_CustomThemedButton_m7uBBu) {
  &:not([disabled]) {
    width: var(--input_CustomThemedButton__width_m7uBBu);
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_CustomThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_CustomThemedButton__$active_m7uBBu", {
        "style": {
            "--input_CustomThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_CustomThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "CustomThemedButton"
});
