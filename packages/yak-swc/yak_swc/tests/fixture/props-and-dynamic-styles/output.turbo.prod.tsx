import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGRpc3BsYXk6IGZsZXg7CiAgYWxpZ24taXRlbXM6IHZhcigtLXltN3VCQnUxKTsKICBmbGV4LWRpcmVjdGlvbjogdmFyKC0teW03dUJCdTIpOwogIGp1c3RpZnktY29udGVudDogdmFyKC0teW03dUJCdTMpOwogIHBhZGRpbmc6IDIwcHg7CiAgbWFyZ2luLWJvdHRvbTogdmFyKC0teW03dUJCdTQpOwogIHRvcDogdmFyKC0teW03dUJCdTUpOwogIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7Cn0KLnltN3VCQnU2IHsKICBib3R0b206IHZhcigtLXltN3VCQnU3KTsKfQ==";
export const FlexContainer = /*YAK EXPORTED STYLED:FlexContainer:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
  display: flex;
  align-items: var(--ym7uBBu1);
  flex-direction: var(--ym7uBBu2);
  justify-content: var(--ym7uBBu3);
  padding: 20px;
  margin-bottom: var(--ym7uBBu4);
  top: var(--ym7uBBu5);
  background-color: #f0f0f0;
}
.ym7uBBu6 {
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
