import { styled, css, __yak_unitPostFix, __yak_mergeCssProp } from "@yak/solid/internal";
import * as __yak from "@yak/solid/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTEgewogIGRpc3BsYXk6IGZsZXg7CiAgYWxpZ24taXRlbXM6IHZhcigtLXltN3VCQnUyKTsKICBtYXJnaW4tYm90dG9tOiB2YXIoLS15bTd1QkJ1Myk7Cn0ueW03dUJCdTQgewogIGNvbG9yOiBibHVlOwp9";
export const Button = /*YAK EXPORTED STYLED:Button:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu");
export const FlexContainer = /*YAK EXPORTED STYLED:FlexContainer:ym7uBBu1*//*YAK Extracted CSS:
.ym7uBBu1 {
  display: flex;
  align-items: var(--ym7uBBu2);
  margin-bottom: var(--ym7uBBu3);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1", {
    "style": {
        "--ym7uBBu2": ({ $align })=>$align || "stretch",
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $spacing })=>$spacing * 8, "px")
    }
});
export const Elem = ()=><div {...__yak_mergeCssProp({
        class: "test-class",
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.ym7uBBu4 {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu4"))}/>;
