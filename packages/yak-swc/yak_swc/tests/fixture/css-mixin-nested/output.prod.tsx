import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css(__styleYak.buttonStyles__$active, {
        "style": {
            "--ym7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBu1": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
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
  @media (max-width: 600px) {
    background-color: #f0f0f0;
    max-width: var(--ym7uBBu2);
  }
}
.ThemedButton {
  width: var(--ym7uBBu3);
}
*/ /*#__PURE__*/ __yak.__yak_button(__styleYak.ThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.ThemedButton__$active, {
        "style": {
            "--ym7uBBu2": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const CustomThemedButton = /*YAK Extracted CSS:
.CustomThemedButton {
  color: red;
  &:not([disabled]) {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
}
.CustomThemedButton__$active {
  &:not([disabled]) {
    @media (max-width: 600px) {
      background-color: #f0f0f0;
      max-width: var(--ym7uBBu4);
    }
  }
}
.CustomThemedButton {
  &:not([disabled]) {
    width: var(--ym7uBBu5);
  }
}
*/ /*#__PURE__*/ __yak.__yak_button(__styleYak.CustomThemedButton, ({ $active })=>$active && /*#__PURE__*/ css(__styleYak.CustomThemedButton__$active, {
        "style": {
            "--ym7uBBu4": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBu5": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
