import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Dynamic value wrapped in quotes should produce `var(--xxx)` (unquoted),
// because `var()` references inside string literals are treated as literal
// text by the CSS engine and never get substituted.
const Input = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  &::before {
    content: var(--ym7uBBu1);
  }
  &::after {
    content: var(--ym7uBBu2);
  }
}
*/ /*#__PURE__*/ __yak.__yak_input("ym7uBBu", {
    "style": {
        "--ym7uBBu1": (p)=>p.$placeholder,
        "--ym7uBBu2": (p)=>p.$marker
    }
});
// var() inside url() works because url() evaluates the var, so
// `url("${...}")` is also stripped to `url(var(--xxx))`.
const Bg = /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  background: url(var(--ym7uBBu4));
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3", {
    "style": {
        "--ym7uBBu4": (p)=>p.$url
    }
});
// Partial interpolation is intentionally NOT rewritten — the surrounding
// static text means the user must restructure their CSS (e.g. split into
// multiple values) for var() to actually substitute.
const Partial = /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  &::before {
    content: "Hello var(--ym7uBBu6)";
  }
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu5", {
    "style": {
        "--ym7uBBu6": (p)=>p.$name
    }
});
