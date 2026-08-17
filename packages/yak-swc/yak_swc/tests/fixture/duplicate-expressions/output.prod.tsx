import { styled, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Identical prop arrow used in two declarations
const TwiceSameArrow = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  left: var(--ym7uBBu1);
  right: var(--ym7uBBu1);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu", {
    "style": {
        "--ym7uBBu1": /*#__PURE__*/ __yak_unitPostFix(({ $x })=>$x, "px")
    }
});
// Identical logic, but one side carries a TS parameter annotation
const TypedVsUntyped = /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  top: var(--ym7uBBu3);
  bottom: var(--ym7uBBu3);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu2", {
    "style": {
        "--ym7uBBu3": /*#__PURE__*/ __yak_unitPostFix(({ $y })=>$y, "px")
    }
});
// Identical calculation including a Math.min call
const WithCalculation = /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  width: var(--ym7uBBu5);
  max-width: var(--ym7uBBu5);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4", {
    "style": {
        "--ym7uBBu5": /*#__PURE__*/ __yak_unitPostFix(({ $ratio })=>Math.min($ratio * 100, 100), "%")
    }
});
// Same expression but different trailing units: must stay separate
const DifferentUnits = /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  width: var(--ym7uBBu7);
  height: var(--ym7uBBu8);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu6", {
    "style": {
        "--ym7uBBu7": /*#__PURE__*/ __yak_unitPostFix(({ $size })=>$size, "px"),
        "--ym7uBBu8": /*#__PURE__*/ __yak_unitPostFix(({ $size })=>$size, "rem")
    }
});
// Parenthesized arrow vs plain arrow
const Parens = /*YAK Extracted CSS:
:global(.ym7uBBu9) {
  margin-left: var(--ym7uBBuA);
  margin-right: var(--ym7uBBuA);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu9", {
    "style": {
        "--ym7uBBuA": /*#__PURE__*/ __yak_unitPostFix(({ $z })=>$z, "px")
    }
});
// Different props: must stay separate
const DifferentProps = /*YAK Extracted CSS:
:global(.ym7uBBuB) {
  padding-left: var(--ym7uBBuC);
  padding-right: var(--ym7uBBuD);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuB", {
    "style": {
        "--ym7uBBuC": /*#__PURE__*/ __yak_unitPostFix(({ $a })=>$a, "px"),
        "--ym7uBBuD": /*#__PURE__*/ __yak_unitPostFix(({ $b })=>$b, "px")
    }
});
// Same bindings, different destructuring order in the parameter
const DestructureOrder = /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  width: var(--ym7uBBuF);
  height: var(--ym7uBBuF);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuE", {
    "style": {
        "--ym7uBBuF": /*#__PURE__*/ __yak_unitPostFix(({ $a, $b })=>$a * $b, "px")
    }
});
// A sibling-referencing default: reordering changes behavior
const DefaultReferencesSibling = /*YAK Extracted CSS:
:global(.ym7uBBuG) {
  min-width: var(--ym7uBBuH);
  min-height: var(--ym7uBBuI);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuG", {
    "style": {
        "--ym7uBBuH": /*#__PURE__*/ __yak_unitPostFix(({ $a, $b = $a })=>$a * $b, "px"),
        "--ym7uBBuI": /*#__PURE__*/ __yak_unitPostFix(({ $b = 1, $a })=>$a * $b, "px")
    }
});
// Repeated interpolations inside a single declaration value
const Dot = /*YAK Extracted CSS:
:global(.ym7uBBuJ) {
  animation-range: max(0%, calc((var(--ym7uBBuK) - 1) * 100% / (var(--ym7uBBuL) - 1)))
min(100%, calc((var(--ym7uBBuK) + 1) * 100% / (var(--ym7uBBuL) - 1)));
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuJ", {
    "style": {
        "--ym7uBBuK": ({ $index })=>$index,
        "--ym7uBBuL": ({ $slideCount })=>$slideCount
    }
});
