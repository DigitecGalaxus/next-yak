import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FlexContainer = /*YAK Extracted CSS:
.FlexContainer {
  display: flex;
  align-items: var(--ym7uBBu);
  flex-direction: var(--ym7uBBu1);
  justify-content: var(--ym7uBBu2);
  padding: 20px;
  margin-bottom: var(--ym7uBBu3);
  top: var(--ym7uBBu4);
  background-color: #f0f0f0;
}
.FlexContainer__ {
  bottom: var(--ym7uBBu5);
}
*/ /*#__PURE__*/ __yak.__yak_div(__styleYak.FlexContainer, ({ $bottom })=>/*#__PURE__*/ css(__styleYak.FlexContainer__, {
        "style": {
            "--ym7uBBu5": /*#__PURE__*/ __yak_unitPostFix($bottom * 20, "%")
        }
    }), {
    "style": {
        "--ym7uBBu": ({ $align })=>$align || 'stretch',
        "--ym7uBBu1": ({ $direction })=>$direction || 'row',
        "--ym7uBBu2": ({ $justify })=>$justify || 'flex-start',
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $marginBottom })=>$marginBottom || '0', "px"),
        "--ym7uBBu4": /*#__PURE__*/ __yak_unitPostFix(({ $top })=>$top * 20, "%")
    }
});
