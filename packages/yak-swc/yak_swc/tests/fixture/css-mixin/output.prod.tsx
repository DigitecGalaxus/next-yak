import { css, __yak_button, __yak_unitPostFix } from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css(__styleYak.buttonStyles__$active, {
        "style": {
            "--ym7uBBu": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.buttonStyles__);
}, {
    "style": {
        "--ym7uBBu1": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK Extracted CSS:
.ThemedButton {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.ThemedButton__$active {
  background-color: #f0f0f0;
  max-width: var(--ym7uBBu2);
}
.ThemedButton {
  width: var(--ym7uBBu3);
}
.ThemedButton__ {
  color: red;
}
*/ /*#__PURE__*/ __yak_button(__styleYak.ThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.ThemedButton__$active, {
        "style": {
            "--ym7uBBu2": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.ThemedButton__);
}, {
    "style": {
        "--ym7uBBu3": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const CustomThemedButton = /*YAK Extracted CSS:
.CustomThemedButton {
  color: red;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.CustomThemedButton__$active {
  background-color: #f0f0f0;
  max-width: var(--ym7uBBu4);
}
.CustomThemedButton {
  width: var(--ym7uBBu5);
}
.CustomThemedButton__ {
  color: red;
}
*/ /*#__PURE__*/ __yak_button(__styleYak.CustomThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.CustomThemedButton__$active, {
        "style": {
            "--ym7uBBu4": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.CustomThemedButton__);
}, {
    "style": {
        "--ym7uBBu5": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
