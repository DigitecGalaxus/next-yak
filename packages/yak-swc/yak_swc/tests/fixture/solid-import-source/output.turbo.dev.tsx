import { styled, css, __yak_unitPostFix, __yak_mergeCssProp } from "@yak/solid/internal";
import * as __yak from "@yak/solid/internal";
import "data:text/css;base64,LmlucHV0X0J1dHRvbl9tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0uaW5wdXRfRmxleENvbnRhaW5lcl9tN3VCQnUgewogIGRpc3BsYXk6IGZsZXg7CiAgYWxpZ24taXRlbXM6IHZhcigtLWlucHV0X0ZsZXhDb250YWluZXJfX2FsaWduLWl0ZW1zX203dUJCdSk7CiAgbWFyZ2luLWJvdHRvbTogdmFyKC0taW5wdXRfRmxleENvbnRhaW5lcl9fbWFyZ2luLWJvdHRvbV9tN3VCQnUpOwp9LmlucHV0X0VsZW1fbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfQ==";
export const Button = /*YAK EXPORTED STYLED:Button:input_Button_m7uBBu*//*YAK Extracted CSS:
.input_Button_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu"), {
    "displayName": "Button"
});
export const FlexContainer = /*YAK EXPORTED STYLED:FlexContainer:input_FlexContainer_m7uBBu*//*YAK Extracted CSS:
.input_FlexContainer_m7uBBu {
  display: flex;
  align-items: var(--input_FlexContainer__align-items_m7uBBu);
  margin-bottom: var(--input_FlexContainer__margin-bottom_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_FlexContainer_m7uBBu", {
    "style": {
        "--input_FlexContainer__align-items_m7uBBu": ({ $align })=>$align || "stretch",
        "--input_FlexContainer__margin-bottom_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $spacing })=>$spacing * 8, "px")
    }
}), {
    "displayName": "FlexContainer"
});
export const Elem = ()=><div {...__yak_mergeCssProp({
        class: "test-class",
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.input_Elem_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ css("input_Elem_m7uBBu"))}/>;
