import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X1N0eWxlZERpdl9tN3VCQnUgewogIHdpZHRoOiB2YXIoLS1pbnB1dF9TdHlsZWREaXZfX3dpZHRoX203dUJCdSk7CiAgaGVpZ2h0OiAyNHB4Owp9LmlucHV0X1N0eWxlZEJ1dHRvbl9fXCRhY3RpdmVfbTd1QkJ1IHsKICB3aWR0aDogdmFyKC0taW5wdXRfU3R5bGVkQnV0dG9uX193aWR0aF9tN3VCQnUpOwogIGhlaWdodDogMzJweDsKfQ==";
const SIZES: Record<"sm" | "md", {
    width: string;
    height: string;
}> = {
    sm: {
        width: '24px',
        height: '24px'
    },
    md: {
        width: '32px',
        height: '32px'
    }
};
const StyledDiv = /*YAK Extracted CSS:
.input_StyledDiv_m7uBBu {
  width: var(--input_StyledDiv__width_m7uBBu);
  height: 24px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_StyledDiv_m7uBBu", {
    "style": {
        "--input_StyledDiv__width_m7uBBu": ({ $size })=>SIZES[$size].width
    }
}), {
    "displayName": "StyledDiv"
});
const StyledButton = /*YAK Extracted CSS:
.input_StyledButton__\$active_m7uBBu {
  width: var(--input_StyledButton__width_m7uBBu);
  height: 32px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_StyledButton_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_StyledButton__$active_m7uBBu", {
        "style": {
            "--input_StyledButton__width_m7uBBu": ({ $size })=>SIZES[$size].width
        }
    })), {
    "displayName": "StyledButton"
});
