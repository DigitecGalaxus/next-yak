import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("buttonStyles__$active_m7uBBu", {
        "style": {
            "--buttonStyles__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("buttonStyles___m7uBBu");
}, {
    "style": {
        "--buttonStyles__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK Extracted CSS:
:global(.ThemedButton_m7uBBu) {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.ThemedButton__$active_m7uBBu) {
  background-color: #f0f0f0;
  max-width: var(--ThemedButton__max-width_m7uBBu);
}
:global(.ThemedButton_m7uBBu) {
  width: var(--ThemedButton__width_m7uBBu);
}
:global(.ThemedButton___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("ThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("ThemedButton__$active_m7uBBu", {
        "style": {
            "--ThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("ThemedButton___m7uBBu");
}, {
    "style": {
        "--ThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "ThemedButton"
});
export const CustomThemedButton = /*YAK Extracted CSS:
:global(.CustomThemedButton_m7uBBu) {
  color: red;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
:global(.CustomThemedButton__$active_m7uBBu) {
  background-color: #f0f0f0;
  max-width: var(--CustomThemedButton__max-width_m7uBBu);
}
:global(.CustomThemedButton_m7uBBu) {
  width: var(--CustomThemedButton__width_m7uBBu);
}
:global(.CustomThemedButton___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("CustomThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("CustomThemedButton__$active_m7uBBu", {
        "style": {
            "--CustomThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("CustomThemedButton___m7uBBu");
}, {
    "style": {
        "--CustomThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "CustomThemedButton"
});
