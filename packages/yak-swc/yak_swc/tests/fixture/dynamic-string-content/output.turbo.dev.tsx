import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0lucHV0X203dUJCdSB7CiAgJjo6YmVmb3JlIHsKICAgIGNvbnRlbnQ6IHZhcigtLWlucHV0X0lucHV0X19jb250ZW50X203dUJCdSk7CiAgfQogICY6OmFmdGVyIHsKICAgIGNvbnRlbnQ6IHZhcigtLWlucHV0X0lucHV0X19jb250ZW50X203dUJCdS0wMSk7CiAgfQp9LmlucHV0X0JnX203dUJCdSB7CiAgYmFja2dyb3VuZDogdXJsKHZhcigtLWlucHV0X0JnX19iYWNrZ3JvdW5kX203dUJCdSkpOwp9LmlucHV0X1BhcnRpYWxfbTd1QkJ1IHsKICAmOjpiZWZvcmUgewogICAgY29udGVudDogIkhlbGxvIHZhcigtLWlucHV0X1BhcnRpYWxfX2NvbnRlbnRfbTd1QkJ1KSI7CiAgfQp9";
// Dynamic value wrapped in quotes should produce `var(--xxx)` (unquoted),
// because `var()` references inside string literals are treated as literal
// text by the CSS engine and never get substituted.
const Input = /*YAK Extracted CSS:
.input_Input_m7uBBu {
  &::before {
    content: var(--input_Input__content_m7uBBu);
  }
  &::after {
    content: var(--input_Input__content_m7uBBu-01);
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_input("input_Input_m7uBBu", {
    "style": {
        "--input_Input__content_m7uBBu": (p)=>p.$placeholder,
        "--input_Input__content_m7uBBu-01": (p)=>p.$marker
    }
}), {
    "displayName": "Input"
});
// var() inside url() works because url() evaluates the var, so
// `url("${...}")` is also stripped to `url(var(--xxx))`.
const Bg = /*YAK Extracted CSS:
.input_Bg_m7uBBu {
  background: url(var(--input_Bg__background_m7uBBu));
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Bg_m7uBBu", {
    "style": {
        "--input_Bg__background_m7uBBu": (p)=>p.$url
    }
}), {
    "displayName": "Bg"
});
// Partial interpolation is intentionally NOT rewritten — the surrounding
// static text means the user must restructure their CSS (e.g. split into
// multiple values) for var() to actually substitute.
const Partial = /*YAK Extracted CSS:
.input_Partial_m7uBBu {
  &::before {
    content: "Hello var(--input_Partial__content_m7uBBu)";
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Partial_m7uBBu", {
    "style": {
        "--input_Partial__content_m7uBBu": (p)=>p.$name
    }
}), {
    "displayName": "Partial"
});
