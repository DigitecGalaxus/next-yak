import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X1RoZW1lZEJ1dHRvbl9tN3VCQnUgewogIHBhZGRpbmc6IDEwcHggMjBweDsKICBib3JkZXI6IG5vbmU7CiAgYm9yZGVyLXJhZGl1czogNXB4OwogIGN1cnNvcjogcG9pbnRlcjsKfQouaW5wdXRfVGhlbWVkQnV0dG9uX19cJGFjdGl2ZV9tN3VCQnUgewogIEBtZWRpYSAobWF4LXdpZHRoOiA2MDBweCkgewogICAgYmFja2dyb3VuZC1jb2xvcjogI2YwZjBmMDsKICAgIG1heC13aWR0aDogdmFyKC0taW5wdXRfVGhlbWVkQnV0dG9uX19tYXgtd2lkdGhfbTd1QkJ1KTsKICB9Cn0KLmlucHV0X1RoZW1lZEJ1dHRvbl9tN3VCQnUgewogIHdpZHRoOiB2YXIoLS1pbnB1dF9UaGVtZWRCdXR0b25fX3dpZHRoX203dUJCdSk7Cn0uaW5wdXRfQ3VzdG9tVGhlbWVkQnV0dG9uX203dUJCdSB7CiAgY29sb3I6IHJlZDsKICAmOm5vdChbZGlzYWJsZWRdKSB7CiAgICBwYWRkaW5nOiAxMHB4IDIwcHg7CiAgICBib3JkZXI6IG5vbmU7CiAgICBib3JkZXItcmFkaXVzOiA1cHg7CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgfQp9Ci5pbnB1dF9DdXN0b21UaGVtZWRCdXR0b25fX1wkYWN0aXZlX203dUJCdSB7CiAgJjpub3QoW2Rpc2FibGVkXSkgewogICAgQG1lZGlhIChtYXgtd2lkdGg6IDYwMHB4KSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7CiAgICAgIG1heC13aWR0aDogdmFyKC0taW5wdXRfQ3VzdG9tVGhlbWVkQnV0dG9uX19tYXgtd2lkdGhfbTd1QkJ1KTsKICAgIH0KICB9Cn0KLmlucHV0X0N1c3RvbVRoZW1lZEJ1dHRvbl9tN3VCQnUgewogICY6bm90KFtkaXNhYmxlZF0pIHsKICAgIHdpZHRoOiB2YXIoLS1pbnB1dF9DdXN0b21UaGVtZWRCdXR0b25fX3dpZHRoX203dUJCdSk7CiAgfQp9";
const buttonStyles = /*#__PURE__*/ css(({ $active })=>$active && /*#__PURE__*/ css("input_buttonStyles__$active_m7uBBu", {
        "style": {
            "--input_buttonStyles__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_buttonStyles__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
});
export const ThemedButton = /*YAK EXPORTED STYLED:ThemedButton:input_ThemedButton_m7uBBu*//*YAK Extracted CSS:
.input_ThemedButton_m7uBBu {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.input_ThemedButton__\$active_m7uBBu {
  @media (max-width: 600px) {
    background-color: #f0f0f0;
    max-width: var(--input_ThemedButton__max-width_m7uBBu);
  }
}
.input_ThemedButton_m7uBBu {
  width: var(--input_ThemedButton__width_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_ThemedButton__$active_m7uBBu", {
        "style": {
            "--input_ThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_ThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "ThemedButton"
});
export const CustomThemedButton = /*YAK EXPORTED STYLED:CustomThemedButton:input_CustomThemedButton_m7uBBu*//*YAK Extracted CSS:
.input_CustomThemedButton_m7uBBu {
  color: red;
  &:not([disabled]) {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
}
.input_CustomThemedButton__\$active_m7uBBu {
  &:not([disabled]) {
    @media (max-width: 600px) {
      background-color: #f0f0f0;
      max-width: var(--input_CustomThemedButton__max-width_m7uBBu);
    }
  }
}
.input_CustomThemedButton_m7uBBu {
  &:not([disabled]) {
    width: var(--input_CustomThemedButton__width_m7uBBu);
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_CustomThemedButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_CustomThemedButton__$active_m7uBBu", {
        "style": {
            "--input_CustomThemedButton__max-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 15, "px")
        }
    }), {
    "style": {
        "--input_CustomThemedButton__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $letters })=>$letters * 10, "px")
    }
}), {
    "displayName": "CustomThemedButton"
});
