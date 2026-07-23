import { css, styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0NhdGVnb3J5X203dUJCdSB7CiAgY29sb3I6IGdyZXk7Cn0KLmlucHV0X0NhdGVnb3J5X19fbTd1QkJ1IHsKICBjb2xvcjogY3JpbXNvbjsKfS5pbnB1dF9TaG9ydGN1dF9tN3VCQnUgewogIGNvbG9yOiBncmV5Owp9Ci5pbnB1dF9TaG9ydGN1dF9fX203dUJCdSB7CiAgY29sb3I6IGRvZGdlcmJsdWU7Cn0uaW5wdXRfQ3Jvc3NfbTd1QkJ1IHsKICBjb2xvcjogZ3JleTsKfS5pbnB1dF9FbW9qaV9tN3VCQnUgewogIGNvbG9yOiBncmV5Owp9";
// JSX attribute strings are decoded before they reach the condition:
// entities like &amp; and literal backslashes must compare by value,
// not by their JSX source spelling
const Category = /*YAK Extracted CSS:
.input_Category_m7uBBu {
  color: grey;
}
.input_Category___m7uBBu {
  color: crimson;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_Category_m7uBBu", ({ $label })=>$label === "Food & Drink" && /*#__PURE__*/ css("input_Category___m7uBBu")), {
    "displayName": "Category"
});
const Shortcut = /*YAK Extracted CSS:
.input_Shortcut_m7uBBu {
  color: grey;
}
.input_Shortcut___m7uBBu {
  color: dodgerblue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_kbd("input_Shortcut_m7uBBu", ({ $keys })=>$keys === "a\\tb" && /*#__PURE__*/ css("input_Shortcut___m7uBBu")), {
    "displayName": "Shortcut"
});
// A static merge goes through expression position so a backslash escape in the
// user className survives the JSX re-parse instead of doubling
const Cross = /*YAK Extracted CSS:
.input_Cross_m7uBBu {
  color: grey;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Cross_m7uBBu"), {
    "displayName": "Cross"
});
// An emoji is valid UTF-8, so a static merge copies it byte for byte
const Emoji = /*YAK Extracted CSS:
.input_Emoji_m7uBBu {
  color: grey;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Emoji_m7uBBu"), {
    "displayName": "Emoji"
});
export const Menu = ()=><>
    <li className={"input_Category_m7uBBu" + ("Food & Drink" === "Food & Drink" ? " input_Category___m7uBBu" : "")}>Food &amp; Drink</li>
    <kbd className={"input_Shortcut_m7uBBu" + ("a\\tb" === "a\\tb" ? " input_Shortcut___m7uBBu" : "")}>a\tb</kbd>
    <span className={"input_Cross_m7uBBu before:content-['\\00d7'] icon & more"}>x</span>
    <span className={"input_Emoji_m7uBBu 🔥 mark"}>x</span>
  </>;
