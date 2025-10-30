import { styled, css, keyframes } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUxIHsKICBhbmltYXRpb246IHltN3VCQnUyIDFzIGVhc2UtaW47Cn0KLnltN3VCQnUzIHsKICBhbmltYXRpb246IHltN3VCQnU0IDFzIGVhc2UtaW47Cn0KLnltN3VCQnUgewogIGZvbnQtc2l6ZTogMThweDsKICBjb2xvcjogIzMzMzsKfUBrZXlmcmFtZXMgeW03dUJCdTQgewogIGZyb20gewogICAgb3BhY2l0eTogMDsKICB9CiAgdG8gewogICAgb3BhY2l0eTogMTsKICB9Cn1Aa2V5ZnJhbWVzIHltN3VCQnUyIHsKICBmcm9tIHsKICAgIG9wYWNpdHk6IDE7CiAgfQogIHRvIHsKICAgIG9wYWNpdHk6IDA7CiAgfQp9QGtleWZyYW1lcyB5bTd1QkJ1NSB7CiAgdG8gewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjAwcHgsIDIwMHB4KTsKICB9Cn1Aa2V5ZnJhbWVzIHltN3VCQnU2IHsKICBmcm9tIHsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsKICB9CiAgdG8gewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDQwMHB4KTsKICB9Cn0ueW03dUJCdTcgewogIGJhY2tncm91bmQtY29sb3I6ICNmMDA7CiAgYW5pbWF0aW9uOiB5bTd1QkJ1NiAxcyBlYXNlLWluLW91dCwgeW03dUJCdTQgMXMgZWFzZS1pbjsKICAmOmhvdmVyIHsKICAgIGFuaW1hdGlvbjogeW03dUJCdTUgMXMgZWFzZS1pbi1vdXQsIHltN3VCQnUyIDFzIGVhc2UtaW47CiAgfQp9";
export const FadeInText = /*YAK EXPORTED STYLED:FadeInText:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu1 {
  animation: ym7uBBu2 1s ease-in;
}
.ym7uBBu3 {
  animation: ym7uBBu4 1s ease-in;
}
.ym7uBBu {
  font-size: 18px;
  color: #333;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu", ({ $reverse })=>$reverse ? /*#__PURE__*/ css("ym7uBBu1") : /*#__PURE__*/ css("ym7uBBu3"));
const animations = {
    fadeIn: /*YAK Extracted CSS:
@keyframes ym7uBBu4 {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu4"),
    fadeOut: /*YAK Extracted CSS:
@keyframes ym7uBBu2 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu2")
};
const slides = {
    200: /*YAK Extracted CSS:
@keyframes ym7uBBu5 {
  to {
    transform: translate(200px, 200px);
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu5"),
    "x400": /*YAK Extracted CSS:
@keyframes ym7uBBu6 {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(400px);
  }
}
*/ /*#__PURE__*/ keyframes("ym7uBBu6")
};
export const FancyButton = /*YAK EXPORTED STYLED:FancyButton:ym7uBBu7*//*YAK Extracted CSS:
.ym7uBBu7 {
  background-color: #f00;
  animation: ym7uBBu6 1s ease-in-out, ym7uBBu4 1s ease-in;
  &:hover {
    animation: ym7uBBu5 1s ease-in-out, ym7uBBu2 1s ease-in;
  }
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu7");
