import { styled, css, __yak_unitPostFix } from "@yak/react/internal";
import * as __yak from "@yak/react/internal";
import "data:text/css;base64,LmlucHV0X0VtcHR5U2VsZWN0b3JfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwogICB7CiAgICBjb2xvcjogYmx1ZTsKICB9Cn0uaW5wdXRfRHluYW1pY1NlbGVjdG9yX203dUJCdSB7CiAgIHsKICAgIGNvbG9yOiByZWQ7CiAgfQp9LmlucHV0X0R5bmFtaWNNZWRpYVF1ZXJ5X203dUJCdSB7CiAgIHsKICAgIGNvbG9yOiByZWQ7CiAgfQp9LmlucHV0X0NvbnN0YW50TWVkaWFRdWVyeV9tN3VCQnUgewogIEBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkgewogICAgY29sb3I6IHJlZDsKICB9Cn0uaW5wdXRfTWlzc2luZ0NvbG9uX203dUJCdSB7CiAgY29sb3IgcmVkOiA7CiAgLmZvbyB7CiAgICBtYXJnaW4gMCA6IDsKICB9CiAgcGFkZGluZzogMDsKfS5pbnB1dF9BdFJ1bGVzX203dUJCdSB7CiAgQG1lZGlhIChtaW4td2lkdGg6IDY0MHB4KSB7CiAgICBjb2xvcjogcmVkOwogIH0KfS5pbnB1dF9DdXN0b21Qcm9wZXJ0eUJsb2NrX203dUJCdSB7CiAgLS1taXhpbjogeyBjb2xvcjogcmVkIH07CiAgY29sb3I6IGJsdWU7Cn0=";
export const EmptySelector = /*YAK EXPORTED STYLED:EmptySelector:input_EmptySelector_m7uBBu*//*YAK Extracted CSS:
.input_EmptySelector_m7uBBu {
  color: red;
   {
    color: blue;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_EmptySelector_m7uBBu"), {
    "displayName": "EmptySelector"
});
export const DynamicSelector = /*YAK EXPORTED STYLED:DynamicSelector:input_DynamicSelector_m7uBBu*//*YAK Extracted CSS:
.input_DynamicSelector_m7uBBu {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DynamicSelector_m7uBBu", (p)=>p.$selector), {
    "displayName": "DynamicSelector"
});
const media = {
    up: (width: string)=>`@media (min-width: ${width})`
};
export const DynamicMediaQuery = /*YAK EXPORTED STYLED:DynamicMediaQuery:input_DynamicMediaQuery_m7uBBu*//*YAK Extracted CSS:
.input_DynamicMediaQuery_m7uBBu {
   {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DynamicMediaQuery_m7uBBu", media.up("768px")), {
    "displayName": "DynamicMediaQuery"
});
const desktop = "@media (min-width: 768px)";
export const ConstantMediaQuery = /*YAK EXPORTED STYLED:ConstantMediaQuery:input_ConstantMediaQuery_m7uBBu*//*YAK Extracted CSS:
.input_ConstantMediaQuery_m7uBBu {
  @media (min-width: 768px) {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ConstantMediaQuery_m7uBBu"), {
    "displayName": "ConstantMediaQuery"
});
export const MissingColon = /*YAK EXPORTED STYLED:MissingColon:input_MissingColon_m7uBBu*//*YAK Extracted CSS:
.input_MissingColon_m7uBBu {
  color red: ;
  .foo {
    margin 0 : ;
  }
  padding: 0;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MissingColon_m7uBBu"), {
    "displayName": "MissingColon"
});
export const missingColonAtEnd = /*YAK EXPORTED MIXIN:missingColonAtEnd
padding: 0;
color red: ;
*/ /*#__PURE__*/ css();
export const AtRules = /*YAK EXPORTED STYLED:AtRules:input_AtRules_m7uBBu*//*YAK Extracted CSS:
.input_AtRules_m7uBBu {
  @media (min-width: 640px) {
    color: red;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_AtRules_m7uBBu"), {
    "displayName": "AtRules"
});
export const UnclosedMediaQuery = /*YAK EXPORTED STYLED:UnclosedMediaQuery:input_UnclosedMediaQuery_m7uBBu*//*YAK Extracted CSS:

*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_UnclosedMediaQuery_m7uBBu"), {
    "displayName": "UnclosedMediaQuery"
});
export const UnclosedFunction = /*YAK EXPORTED STYLED:UnclosedFunction:input_UnclosedFunction_m7uBBu*//*YAK Extracted CSS:

*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_UnclosedFunction_m7uBBu", {
    "style": {
        "--input_UnclosedFunction__transform_m7uBBu": /*#__PURE__*/ __yak_unitPostFix((p)=>p.$deg, "deg")
    }
}), {
    "displayName": "UnclosedFunction"
});
export const CustomPropertyBlock = /*YAK EXPORTED STYLED:CustomPropertyBlock:input_CustomPropertyBlock_m7uBBu*//*YAK Extracted CSS:
.input_CustomPropertyBlock_m7uBBu {
  --mixin: { color: red };
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_CustomPropertyBlock_m7uBBu"), {
    "displayName": "CustomPropertyBlock"
});
