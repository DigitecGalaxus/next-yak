import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FlexContainer = /*YAK Extracted CSS:
:global(.FlexContainer_m7uBBu) {
  display: flex;
  align-items: var(--FlexContainer__align-items_m7uBBu);
  flex-direction: var(--FlexContainer__flex-direction_m7uBBu);
  justify-content: var(--FlexContainer__justify-content_m7uBBu);
  padding: 20px;
  margin-bottom: var(--FlexContainer__margin-bottom_m7uBBu);
  top: var(--FlexContainer__top_m7uBBu);
  background-color: #f0f0f0;
}
:global(.FlexContainer___m7uBBu) {
  bottom: var(--FlexContainer__bottom_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("FlexContainer_m7uBBu", ({ $bottom })=>/*#__PURE__*/ css("FlexContainer___m7uBBu", {
        "style": {
            "--FlexContainer__bottom_m7uBBu": /*#__PURE__*/ __yak_unitPostFix($bottom * 20, "%")
        }
    }), {
    "style": {
        "--FlexContainer__align-items_m7uBBu": ({ $align })=>$align || 'stretch',
        "--FlexContainer__flex-direction_m7uBBu": ({ $direction })=>$direction || 'row',
        "--FlexContainer__justify-content_m7uBBu": ({ $justify })=>$justify || 'flex-start',
        "--FlexContainer__margin-bottom_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $marginBottom })=>$marginBottom || '0', "px"),
        "--FlexContainer__top_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $top })=>$top * 20, "%")
    }
}), {
    "displayName": "FlexContainer"
});
