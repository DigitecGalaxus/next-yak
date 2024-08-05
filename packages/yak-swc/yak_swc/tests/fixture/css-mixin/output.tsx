import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const buttonStyles = /*#__PURE__*/ css(__styleYak.buttonStyles, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.buttonStyles__$active, {
        "style": {
            "--buttonStyles__max-width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.buttonStyles__);
}, {
    "style": {
        "--buttonStyles__width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
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
  max-width: var(--ThemedButton__max-width_o1wkyu);
}
.ThemedButton {
  width: var(--ThemedButton__width_o1wkyu);
}
.ThemedButton__ {
  color: red;
}
*/ /*#__PURE__*/ styled.button(__styleYak.ThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.ThemedButton__$active, {
        "style": {
            "--ThemedButton__max-width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.ThemedButton__);
}, {
    "style": {
        "--ThemedButton__width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
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
  max-width: var(--CustomThemedButton__max-width_o1wkyu);
}
.CustomThemedButton {
  width: var(--CustomThemedButton__width_o1wkyu);
}
.CustomThemedButton__ {
  color: red;
}
*/ /*#__PURE__*/ styled.button(__styleYak.CustomThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.CustomThemedButton__$active, {
        "style": {
            "--CustomThemedButton__max-width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), function({ $letters }) {
    return $letters > 5 && /*#__PURE__*/ css(__styleYak.CustomThemedButton__);
}, {
    "style": {
        "--CustomThemedButton__width_o1wkyu": __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
