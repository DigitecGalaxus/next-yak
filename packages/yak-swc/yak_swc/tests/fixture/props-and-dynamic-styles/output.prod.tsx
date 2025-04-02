import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const FlexContainer = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  display: flex;
  align-items: var(--ym7uBBu1);
  flex-direction: var(--ym7uBBu2);
  justify-content: var(--ym7uBBu3);
  padding: 20px;
  margin-bottom: var(--ym7uBBu4);
  top: var(--ym7uBBu5);
  background-color: #f0f0f0;
}
:global(.ym7uBBu6) {
  bottom: var(--ym7uBBu7);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", ({ $bottom })=>/*#__PURE__*/ css("ym7uBBu6", {
        "style": {
            "--ym7uBBu7": /*#__PURE__*/ __yak_unitPostFix($bottom * 20, "%")
        }
    }), {
    "style": {
        "--ym7uBBu1": ({ $align })=>$align || 'stretch',
        "--ym7uBBu2": ({ $direction })=>$direction || 'row',
        "--ym7uBBu3": ({ $justify })=>$justify || 'flex-start',
        "--ym7uBBu4": /*#__PURE__*/ __yak_unitPostFix(({ $marginBottom })=>$marginBottom || '0', "px"),
        "--ym7uBBu5": /*#__PURE__*/ __yak_unitPostFix(({ $top })=>$top * 20, "%")
    }
});
