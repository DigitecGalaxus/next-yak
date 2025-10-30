import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0ZhZGVJblRleHRfX1wkcmV2ZXJzZV9tN3VCQnUgewogIGFuaW1hdGlvbjogYW5pbWF0aW9uc19mYWRlT3V0X203dUJCdSAxcyBlYXNlLWluOwp9Ci5pbnB1dF9GYWRlSW5UZXh0X19ub3RfXCRyZXZlcnNlX203dUJCdSB7CiAgYW5pbWF0aW9uOiBhbmltYXRpb25zX2ZhZGVJbl9tN3VCQnUgMXMgZWFzZS1pbjsKfQouaW5wdXRfRmFkZUluVGV4dF9tN3VCQnUgewogIGZvbnQtc2l6ZTogMThweDsKICBjb2xvcjogIzMzMzsKfUBrZXlmcmFtZXMgYW5pbWF0aW9uc19mYWRlSW5fbTd1QkJ1IHsKICBmcm9tIHsKICAgIG9wYWNpdHk6IDA7CiAgfQogIHRvIHsKICAgIG9wYWNpdHk6IDE7CiAgfQp9QGtleWZyYW1lcyBhbmltYXRpb25zX2ZhZGVPdXRfbTd1QkJ1IHsKICBmcm9tIHsKICAgIG9wYWNpdHk6IDE7CiAgfQogIHRvIHsKICAgIG9wYWNpdHk6IDA7CiAgfQp9QGtleWZyYW1lcyBzbGlkZXNfMjAwX203dUJCdSB7CiAgdG8gewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjAwcHgsIDIwMHB4KTsKICB9Cn1Aa2V5ZnJhbWVzIHNsaWRlc194NDAwX203dUJCdSB7CiAgZnJvbSB7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7CiAgfQogIHRvIHsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg0MDBweCk7CiAgfQp9LmlucHV0X0ZhbmN5QnV0dG9uX203dUJCdSB7CiAgYmFja2dyb3VuZC1jb2xvcjogI2YwMDsKICBhbmltYXRpb246IHNsaWRlc194NDAwX203dUJCdSAxcyBlYXNlLWluLW91dCwgYW5pbWF0aW9uc19mYWRlSW5fbTd1QkJ1IDFzIGVhc2UtaW47CiAgJjpob3ZlciB7CiAgICBhbmltYXRpb246IHNsaWRlc18yMDBfbTd1QkJ1IDFzIGVhc2UtaW4tb3V0LCBhbmltYXRpb25zX2ZhZGVPdXRfbTd1QkJ1IDFzIGVhc2UtaW47CiAgfQp9";
export const FadeInText = /*YAK EXPORTED STYLED:FadeInText:input_FadeInText_m7uBBu*//*YAK Extracted CSS:
.input_FadeInText__\$reverse_m7uBBu {
  animation: animations_fadeOut_m7uBBu 1s ease-in;
}
.input_FadeInText__not_\$reverse_m7uBBu {
  animation: animations_fadeIn_m7uBBu 1s ease-in;
}
.input_FadeInText_m7uBBu {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_FadeInText_m7uBBu", ({ $reverse })=>$reverse ? /*#__PURE__*/ css("input_FadeInText__$reverse_m7uBBu") : /*#__PURE__*/ css("input_FadeInText__not_$reverse_m7uBBu")), {
    "displayName": "FadeInText"
});
const animations = {
    fadeIn: /*YAK Extracted CSS:
@keyframes animations_fadeIn_m7uBBu {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("animations_fadeIn_m7uBBu"),
    fadeOut: /*YAK Extracted CSS:
@keyframes animations_fadeOut_m7uBBu {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes("animations_fadeOut_m7uBBu")
};
const slides = {
    200: /*YAK Extracted CSS:
@keyframes slides_200_m7uBBu {
  to {
    transform: translate(200px, 200px);
  }
}
*/ /*#__PURE__*/ keyframes("slides_200_m7uBBu"),
    "x400": /*YAK Extracted CSS:
@keyframes slides_x400_m7uBBu {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(400px);
  }
}
*/ /*#__PURE__*/ keyframes("slides_x400_m7uBBu")
};
export const FancyButton = /*YAK EXPORTED STYLED:FancyButton:input_FancyButton_m7uBBu*//*YAK Extracted CSS:
.input_FancyButton_m7uBBu {
  background-color: #f00;
  animation: slides_x400_m7uBBu 1s ease-in-out, animations_fadeIn_m7uBBu 1s ease-in;
  &:hover {
    animation: slides_200_m7uBBu 1s ease-in-out, animations_fadeOut_m7uBBu 1s ease-in;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_FancyButton_m7uBBu"), {
    "displayName": "FancyButton"
});
