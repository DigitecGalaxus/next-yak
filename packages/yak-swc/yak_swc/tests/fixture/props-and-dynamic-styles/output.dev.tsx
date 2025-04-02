import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FlexContainer = /*YAK Extracted CSS:
:global(.input_FlexContainer_m7uBBu) {
  display: flex;
  align-items: var(--input_FlexContainer__align-items_m7uBBu);
  flex-direction: var(--input_FlexContainer__flex-direction_m7uBBu);
  justify-content: var(--input_FlexContainer__justify-content_m7uBBu);
  padding: 20px;
  margin-bottom: var(--input_FlexContainer__margin-bottom_m7uBBu);
  top: var(--input_FlexContainer__top_m7uBBu);
  background-color: #f0f0f0;
}
:global(.input_FlexContainer___m7uBBu) {
  bottom: var(--input_FlexContainer__bottom_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_FlexContainer_m7uBBu", ({ $bottom })=>/*#__PURE__*/ css("input_FlexContainer___m7uBBu", {
        "style": {
            "--input_FlexContainer__bottom_m7uBBu": /*#__PURE__*/ __yak_unitPostFix($bottom * 20, "%")
        }
    }), {
    "style": {
        "--input_FlexContainer__align-items_m7uBBu": ({ $align })=>$align || 'stretch',
        "--input_FlexContainer__flex-direction_m7uBBu": ({ $direction })=>$direction || 'row',
        "--input_FlexContainer__justify-content_m7uBBu": ({ $justify })=>$justify || 'flex-start',
        "--input_FlexContainer__margin-bottom_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $marginBottom })=>$marginBottom || '0', "px"),
        "--input_FlexContainer__top_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $top })=>$top * 20, "%")
    }
}), {
    "displayName": "FlexContainer"
});
