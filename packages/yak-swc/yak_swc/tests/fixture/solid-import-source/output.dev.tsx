import { styled, css, __yak_unitPostFix, __yak_mergeCssProp } from "@yak/solid/internal";
import * as __yak from "@yak/solid/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const Button = /*YAK EXPORTED STYLED:Button:input_Button_m7uBBu*//*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu"), {
    "displayName": "Button"
});
export const FlexContainer = /*YAK EXPORTED STYLED:FlexContainer:input_FlexContainer_m7uBBu*//*YAK Extracted CSS:
:global(.input_FlexContainer_m7uBBu) {
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
:global(.input_Elem_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ css("input_Elem_m7uBBu"))}/>;
