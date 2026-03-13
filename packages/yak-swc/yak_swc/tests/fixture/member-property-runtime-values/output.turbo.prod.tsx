import { styled, css } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIHdpZHRoOiB2YXIoLS15bTd1QkJ1MSk7CiAgaGVpZ2h0OiAyNHB4Owp9LnltN3VCQnUzIHsKICB3aWR0aDogdmFyKC0teW03dUJCdTQpOwogIGhlaWdodDogMzJweDsKfQ==";
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
.ym7uBBu {
  width: var(--ym7uBBu1);
  height: 24px;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", {
    "style": {
        "--ym7uBBu1": ({ $size })=>SIZES[$size].width
    }
});
const StyledButton = /*YAK Extracted CSS:
.ym7uBBu3 {
  width: var(--ym7uBBu4);
  height: 32px;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu2", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu3", {
        "style": {
            "--ym7uBBu4": ({ $size })=>SIZES[$size].width
        }
    }));
