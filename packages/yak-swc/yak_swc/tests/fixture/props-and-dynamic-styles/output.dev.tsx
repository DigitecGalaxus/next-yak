import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FlexContainer = /*YAK Extracted CSS:
.FlexContainer {
  display: flex;
  align-items: var(--FlexContainer__align-items_m7uBBu);
  flex-direction: var(--FlexContainer__flex-direction_m7uBBu);
  justify-content: var(--FlexContainer__justify-content_m7uBBu);
  padding: 20px;
  margin-bottom: var(--FlexContainer__margin-bottom_m7uBBu);
  top: var(--FlexContainer__top_m7uBBu);
  background-color: #f0f0f0;
}
.FlexContainer__ {
  bottom: var(--FlexContainer__bottom_m7uBBu);
}
*/ /*#__PURE__*/ __yak.__yak_div(__styleYak.FlexContainer, ({ $bottom })=>/*#__PURE__*/ css(__styleYak.FlexContainer__, {
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
});
