import { styled, css, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0NhcmRfbTd1QkJ1IHsKICBiYWNrZ3JvdW5kOiB1cmwoIi9jYXJkLWJnLmpwZyIpIG5vLXJlcGVhdDsKfQouaW5wdXRfQ2FyZF9fXCRhY3RpdmVfbTd1QkJ1IHsKICBiYWNrZ3JvdW5kOiB1cmwoL2NhcmQtYmctYWN0aXZlLmpwZykgbm8tcmVwZWF0Owp9Ci5pbnB1dF9DYXJkX203dUJCdSB7CiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKHZhcigtLWlucHV0X0NhcmRfX3RyYW5zZm9ybV9tN3VCQnUpKQp0cmFuc2xhdGUoMCwgLTg4cHgpIHJvdGF0ZSh2YXIoLS1pbnB1dF9DYXJkX190cmFuc2Zvcm1fbTd1QkJ1LTAxKSk7Cn0=";
export const Card = /*YAK EXPORTED STYLED:Card:input_Card_m7uBBu*//*YAK Extracted CSS:
.input_Card_m7uBBu {
  background: url("/card-bg.jpg") no-repeat;
}
.input_Card__\$active_m7uBBu {
  background: url(/card-bg-active.jpg) no-repeat;
}
.input_Card_m7uBBu {
  transform: translate(-50%, -50%) rotate(var(--input_Card__transform_m7uBBu))
translate(0, -88px) rotate(var(--input_Card__transform_m7uBBu-01));
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_Card__$active_m7uBBu"), {
    "style": {
        "--input_Card__transform_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ index })=>index * 30, "deg"),
        "--input_Card__transform_m7uBBu-01": /*#__PURE__*/ __yak_unitPostFix(({ index })=>-index * 30, "deg")
    }
}), {
    "displayName": "Card"
});
