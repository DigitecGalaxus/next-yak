import { css, styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiBncmV5Owp9Ci55bTd1QkJ1MSB7CiAgY29sb3I6IGNyaW1zb247Cn0ueW03dUJCdTIgewogIGNvbG9yOiBncmV5Owp9Ci55bTd1QkJ1MyB7CiAgY29sb3I6IGRvZGdlcmJsdWU7Cn0ueW03dUJCdTQgewogIGNvbG9yOiBncmV5Owp9";
// JSX attribute strings are decoded before they reach the condition:
// entities like &amp; and literal backslashes must compare by value,
// not by their JSX source spelling
const Category = /*YAK Extracted CSS:
.ym7uBBu {
  color: grey;
}
.ym7uBBu1 {
  color: crimson;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBu", ({ $label })=>$label === "Food & Drink" && /*#__PURE__*/ css("ym7uBBu1"));
const Shortcut = /*YAK Extracted CSS:
.ym7uBBu2 {
  color: grey;
}
.ym7uBBu3 {
  color: dodgerblue;
}
*/ /*#__PURE__*/ __yak.__yak_kbd("ym7uBBu2", ({ $keys })=>$keys === "a\\tb" && /*#__PURE__*/ css("ym7uBBu3"));
// A static merge goes through expression position so a backslash escape in the
// user className survives the JSX re-parse instead of doubling
const Cross = /*YAK Extracted CSS:
.ym7uBBu4 {
  color: grey;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu4");
export const Menu = ()=><>
    <li className={"ym7uBBu" + ("Food & Drink" === "Food & Drink" ? " ym7uBBu1" : "")}>Food &amp; Drink</li>
    <kbd className={"ym7uBBu2" + ("a\\tb" === "a\\tb" ? " ym7uBBu3" : "")}>a\tb</kbd>
    <span className={"ym7uBBu4 before:content-['\\00d7'] icon & more"}>x</span>
  </>;
