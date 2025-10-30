import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0ZhZGVJblRleHRfX1wkcmV2ZXJzZV9tN3VCQnUgewogIGFuaW1hdGlvbjogZmFkZU91dF9tN3VCQnUgMXMgZWFzZS1pbjsKfQouaW5wdXRfRmFkZUluVGV4dF9fbm90X1wkcmV2ZXJzZV9tN3VCQnUgewogIGFuaW1hdGlvbjogZmFkZUluX203dUJCdSAxcyBlYXNlLWluOwp9Ci5pbnB1dF9GYWRlSW5UZXh0X203dUJCdSB7CiAgZm9udC1zaXplOiAxOHB4OwogIGNvbG9yOiAjMzMzOwp9QGtleWZyYW1lcyBmYWRlSW5fbTd1QkJ1IHsKICBmcm9tIHsKICAgIG9wYWNpdHk6IDA7CiAgfQogIHRvIHsKICAgIG9wYWNpdHk6IDE7CiAgfQp9QGtleWZyYW1lcyBmYWRlT3V0X203dUJCdSB7CiAgZnJvbSB7CiAgICBvcGFjaXR5OiAxOwogIH0KICB0byB7CiAgICBvcGFjaXR5OiAwOwogIH0KfQ==";
export const FadeInText = /*YAK EXPORTED STYLED:FadeInText:input_FadeInText_m7uBBu*//*YAK Extracted CSS:
.input_FadeInText__\$reverse_m7uBBu {
  animation: fadeOut_m7uBBu 1s ease-in;
}
.input_FadeInText__not_\$reverse_m7uBBu {
  animation: fadeIn_m7uBBu 1s ease-in;
}
.input_FadeInText_m7uBBu {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_FadeInText_m7uBBu", ({ $reverse })=>$reverse ? /*#__PURE__*/ css("input_FadeInText__$reverse_m7uBBu") : /*#__PURE__*/ css("input_FadeInText__not_$reverse_m7uBBu")), {
    "displayName": "FadeInText"
});
const fadeIn = /*YAK Extracted CSS:
@keyframes fadeIn_m7uBBu {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("fadeIn_m7uBBu");
const fadeOut = /*YAK Extracted CSS:
@keyframes fadeOut_m7uBBu {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes("fadeOut_m7uBBu");
