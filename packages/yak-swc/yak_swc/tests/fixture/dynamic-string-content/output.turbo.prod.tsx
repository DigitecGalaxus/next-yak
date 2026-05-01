import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogICY6OmJlZm9yZSB7CiAgICBjb250ZW50OiB2YXIoLS15bTd1QkJ1MSk7CiAgfQogICY6OmFmdGVyIHsKICAgIGNvbnRlbnQ6IHZhcigtLXltN3VCQnUyKTsKICB9Cn0ueW03dUJCdTMgewogIGJhY2tncm91bmQ6IHVybCh2YXIoLS15bTd1QkJ1NCkpOwp9LnltN3VCQnU1IHsKICAmOjpiZWZvcmUgewogICAgY29udGVudDogIkhlbGxvIHZhcigtLXltN3VCQnU2KSI7CiAgfQp9";
// Dynamic value wrapped in quotes should produce `var(--xxx)` (unquoted),
// because `var()` references inside string literals are treated as literal
// text by the CSS engine and never get substituted.
const Input = /*YAK Extracted CSS:
.ym7uBBu {
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
.ym7uBBu3 {
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
.ym7uBBu5 {
  &::before {
    content: "Hello var(--ym7uBBu6)";
  }
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu5", {
    "style": {
        "--ym7uBBu6": (p)=>p.$name
    }
});
