import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnU0IHsKICBwYWRkaW5nOiAxMHB4IDIwcHg7CiAgYm9yZGVyOiBub25lOwogIGJvcmRlci1yYWRpdXM6IDVweDsKICBjdXJzb3I6IHBvaW50ZXI7Cn0KLnltN3VCQnU1IHsKICBAbWVkaWEgKG1heC13aWR0aDogNjAwcHgpIHsKICAgIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7CiAgICBtYXgtd2lkdGg6IHZhcigtLXltN3VCQnU2KTsKICB9Cn0KLnltN3VCQnU0IHsKICB3aWR0aDogdmFyKC0teW03dUJCdTcpOwp9LnltN3VCQnU4IHsKICBjb2xvcjogcmVkOwogICY6bm90KFtkaXNhYmxlZF0pIHsKICAgIHBhZGRpbmc6IDEwcHggMjBweDsKICAgIGJvcmRlcjogbm9uZTsKICAgIGJvcmRlci1yYWRpdXM6IDVweDsKICAgIGN1cnNvcjogcG9pbnRlcjsKICB9Cn0KLnltN3VCQnU5IHsKICAmOm5vdChbZGlzYWJsZWRdKSB7CiAgICBAbWVkaWEgKG1heC13aWR0aDogNjAwcHgpIHsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YwZjBmMDsKICAgICAgbWF4LXdpZHRoOiB2YXIoLS15bTd1QkJ1QSk7CiAgICB9CiAgfQp9Ci55bTd1QkJ1OCB7CiAgJjpub3QoW2Rpc2FibGVkXSkgewogICAgd2lkdGg6IHZhcigtLXltN3VCQnVCKTsKICB9Cn0=";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu1", {
        "style": {
            "--ym7uBBu2": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK EXPORTED STYLED:ThemedButton:ym7uBBu4*//*YAK Extracted CSS:
.ym7uBBu4 {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.ym7uBBu5 {
  @media (max-width: 600px) {
    background-color: #f0f0f0;
    max-width: var(--ym7uBBu6);
  }
}
.ym7uBBu4 {
  width: var(--ym7uBBu7);
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu4", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu5", {
        "style": {
            "--ym7uBBu6": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBu7": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const CustomThemedButton = /*YAK EXPORTED STYLED:CustomThemedButton:ym7uBBu8*//*YAK Extracted CSS:
.ym7uBBu8 {
  color: red;
  &:not([disabled]) {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
}
.ym7uBBu9 {
  &:not([disabled]) {
    @media (max-width: 600px) {
      background-color: #f0f0f0;
      max-width: var(--ym7uBBuA);
    }
  }
}
.ym7uBBu8 {
  &:not([disabled]) {
    width: var(--ym7uBBuB);
  }
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu8", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu9", {
        "style": {
            "--ym7uBBuA": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--ym7uBBuB": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
