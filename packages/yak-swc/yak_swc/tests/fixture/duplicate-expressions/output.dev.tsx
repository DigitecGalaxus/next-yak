import { styled, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Identical prop arrow used in two declarations
const TwiceSameArrow = /*YAK Extracted CSS:
:global(.input_TwiceSameArrow_m7uBBu) {
  left: var(--input_TwiceSameArrow__left_m7uBBu);
  right: var(--input_TwiceSameArrow__left_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_TwiceSameArrow_m7uBBu", {
    "style": {
        "--input_TwiceSameArrow__left_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $x })=>$x, "px")
    }
}), {
    "displayName": "TwiceSameArrow"
});
// Identical logic, but one side carries a TS parameter annotation
const TypedVsUntyped = /*YAK Extracted CSS:
:global(.input_TypedVsUntyped_m7uBBu) {
  top: var(--input_TypedVsUntyped__top_m7uBBu);
  bottom: var(--input_TypedVsUntyped__top_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_TypedVsUntyped_m7uBBu", {
    "style": {
        "--input_TypedVsUntyped__top_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $y })=>$y, "px")
    }
}), {
    "displayName": "TypedVsUntyped"
});
// Identical calculation including a Math.min call
const WithCalculation = /*YAK Extracted CSS:
:global(.input_WithCalculation_m7uBBu) {
  width: var(--input_WithCalculation__width_m7uBBu);
  max-width: var(--input_WithCalculation__width_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_WithCalculation_m7uBBu", {
    "style": {
        "--input_WithCalculation__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $ratio })=>Math.min($ratio * 100, 100), "%")
    }
}), {
    "displayName": "WithCalculation"
});
// Same expression but different trailing units: must stay separate
const DifferentUnits = /*YAK Extracted CSS:
:global(.input_DifferentUnits_m7uBBu) {
  width: var(--input_DifferentUnits__width_m7uBBu);
  height: var(--input_DifferentUnits__height_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DifferentUnits_m7uBBu", {
    "style": {
        "--input_DifferentUnits__height_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $size })=>$size, "rem"),
        "--input_DifferentUnits__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $size })=>$size, "px")
    }
}), {
    "displayName": "DifferentUnits"
});
// Parenthesized arrow vs plain arrow
const Parens = /*YAK Extracted CSS:
:global(.input_Parens_m7uBBu) {
  margin-left: var(--input_Parens__margin-left_m7uBBu);
  margin-right: var(--input_Parens__margin-left_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Parens_m7uBBu", {
    "style": {
        "--input_Parens__margin-left_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $z })=>$z, "px")
    }
}), {
    "displayName": "Parens"
});
// Different props: must stay separate
const DifferentProps = /*YAK Extracted CSS:
:global(.input_DifferentProps_m7uBBu) {
  padding-left: var(--input_DifferentProps__padding-left_m7uBBu);
  padding-right: var(--input_DifferentProps__padding-right_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DifferentProps_m7uBBu", {
    "style": {
        "--input_DifferentProps__padding-left_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $a })=>$a, "px"),
        "--input_DifferentProps__padding-right_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $b })=>$b, "px")
    }
}), {
    "displayName": "DifferentProps"
});
// Same bindings, different destructuring order in the parameter
const DestructureOrder = /*YAK Extracted CSS:
:global(.input_DestructureOrder_m7uBBu) {
  width: var(--input_DestructureOrder__width_m7uBBu);
  height: var(--input_DestructureOrder__width_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DestructureOrder_m7uBBu", {
    "style": {
        "--input_DestructureOrder__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $a, $b })=>$a * $b, "px")
    }
}), {
    "displayName": "DestructureOrder"
});
// A sibling-referencing default: reordering changes behavior
const DefaultReferencesSibling = /*YAK Extracted CSS:
:global(.input_DefaultReferencesSibling_m7uBBu) {
  min-width: var(--input_DefaultReferencesSibling__min-width_m7uBBu);
  min-height: var(--input_DefaultReferencesSibling__min-height_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_DefaultReferencesSibling_m7uBBu", {
    "style": {
        "--input_DefaultReferencesSibling__min-height_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $b = 1, $a })=>$a * $b, "px"),
        "--input_DefaultReferencesSibling__min-width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $a, $b = $a })=>$a * $b, "px")
    }
}), {
    "displayName": "DefaultReferencesSibling"
});
// Repeated interpolations inside a single declaration value
const Dot = /*YAK Extracted CSS:
:global(.input_Dot_m7uBBu) {
  animation-range: max(0%, calc((var(--input_Dot__animation-range_m7uBBu) - 1) * 100% / (var(--input_Dot__animation-range_m7uBBu-01) - 1)))
min(100%, calc((var(--input_Dot__animation-range_m7uBBu) + 1) * 100% / (var(--input_Dot__animation-range_m7uBBu-01) - 1)));
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Dot_m7uBBu", {
    "style": {
        "--input_Dot__animation-range_m7uBBu": ({ $index })=>$index,
        "--input_Dot__animation-range_m7uBBu-01": ({ $slideCount })=>$slideCount
    }
}), {
    "displayName": "Dot"
});
const Nested = /*YAK Extracted CSS:
:global(.input_Nested_m7uBBu) {
  left: var(--input_Nested__left_m7uBBu);
  right: var(--input_Nested__right_m7uBBu);
  @media (min-width: 768px) {
    left: 0;
    right: 0;
  }
  @media (min-width: 1025px) {
    transform: translate(var(--input_Nested__left_m7uBBu), var(--input_Nested__right_m7uBBu));
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Nested_m7uBBu", {
    "style": {
        "--input_Nested__left_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $x })=>{
            return $x;
        }, "px"),
        "--input_Nested__right_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $y })=>$y, "px")
    }
}), {
    "displayName": "Nested"
});
