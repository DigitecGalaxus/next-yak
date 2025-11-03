import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGJhY2tncm91bmQ6IHVybCgiL2NhcmQtYmcuanBnIikgbm8tcmVwZWF0Owp9Ci55bTd1QkJ1MSB7CiAgYmFja2dyb3VuZDogdXJsKC9jYXJkLWJnLWFjdGl2ZS5qcGcpIG5vLXJlcGVhdDsKfQoueW03dUJCdSB7CiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKHZhcigtLXltN3VCQnUyKSkKdHJhbnNsYXRlKDAsIC04OHB4KSByb3RhdGUodmFyKC0teW03dUJCdTMpKTsKfQ==";
export const Card = /*YAK EXPORTED STYLED:Card:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
  background: url("/card-bg.jpg") no-repeat;
}
.ym7uBBu1 {
  background: url(/card-bg-active.jpg) no-repeat;
}
.ym7uBBu {
  transform: translate(-50%, -50%) rotate(var(--ym7uBBu2))
translate(0, -88px) rotate(var(--ym7uBBu3));
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu1"), {
    "style": {
        "--ym7uBBu2": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
});
