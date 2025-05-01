import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.css!=!./input?./input.yak.css";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_buttonStyles__$active_m7uBBu", {
        "style": {
            "--input_buttonStyles__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("input_buttonStyles___m7uBBu");
}, {
    "style": {
        "--input_buttonStyles__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK EXPORTED STYLED:ThemedButton:input_ThemedButton_m7uBBu*//*YAK Extracted CSS:
.input_ThemedButton_m7uBBu {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.input_ThemedButton__\$active_m7uBBu {
  background-color: #f0f0f0;
  max-width: var(--input_ThemedButton__max-width_m7uBBu);
}
.input_ThemedButton_m7uBBu {
  width: var(--input_ThemedButton__width_m7uBBu);
}
.input_ThemedButton___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_ThemedButton__$active_m7uBBu", {
        "style": {
            "--input_ThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("input_ThemedButton___m7uBBu");
}, {
    "style": {
        "--input_ThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "ThemedButton"
});
export const CustomThemedButton = /*YAK EXPORTED STYLED:CustomThemedButton:input_CustomThemedButton_m7uBBu*//*YAK Extracted CSS:
.input_CustomThemedButton_m7uBBu {
  color: red;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.input_CustomThemedButton__\$active_m7uBBu {
  background-color: #f0f0f0;
  max-width: var(--input_CustomThemedButton__max-width_m7uBBu);
}
.input_CustomThemedButton_m7uBBu {
  width: var(--input_CustomThemedButton__width_m7uBBu);
}
.input_CustomThemedButton___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_CustomThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_CustomThemedButton__$active_m7uBBu", {
        "style": {
            "--input_CustomThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css("input_CustomThemedButton___m7uBBu");
}, {
    "style": {
        "--input_CustomThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "CustomThemedButton"
});
