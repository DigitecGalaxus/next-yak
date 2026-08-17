import { styled, __yak_unitPostFix } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGxlZnQ6IHZhcigtLXltN3VCQnUxKTsKICByaWdodDogdmFyKC0teW03dUJCdTEpOwp9LnltN3VCQnUyIHsKICB0b3A6IHZhcigtLXltN3VCQnUzKTsKICBib3R0b206IHZhcigtLXltN3VCQnUzKTsKfS55bTd1QkJ1NCB7CiAgd2lkdGg6IHZhcigtLXltN3VCQnU1KTsKICBtYXgtd2lkdGg6IHZhcigtLXltN3VCQnU1KTsKfS55bTd1QkJ1NiB7CiAgd2lkdGg6IHZhcigtLXltN3VCQnU3KTsKICBoZWlnaHQ6IHZhcigtLXltN3VCQnU4KTsKfS55bTd1QkJ1OSB7CiAgbWFyZ2luLWxlZnQ6IHZhcigtLXltN3VCQnVBKTsKICBtYXJnaW4tcmlnaHQ6IHZhcigtLXltN3VCQnVBKTsKfS55bTd1QkJ1QiB7CiAgcGFkZGluZy1sZWZ0OiB2YXIoLS15bTd1QkJ1Qyk7CiAgcGFkZGluZy1yaWdodDogdmFyKC0teW03dUJCdUQpOwp9LnltN3VCQnVFIHsKICB3aWR0aDogdmFyKC0teW03dUJCdUYpOwogIGhlaWdodDogdmFyKC0teW03dUJCdUYpOwp9LnltN3VCQnVHIHsKICBtaW4td2lkdGg6IHZhcigtLXltN3VCQnVIKTsKICBtaW4taGVpZ2h0OiB2YXIoLS15bTd1QkJ1SSk7Cn0ueW03dUJCdUogewogIGFuaW1hdGlvbi1yYW5nZTogbWF4KDAlLCBjYWxjKCh2YXIoLS15bTd1QkJ1SykgLSAxKSAqIDEwMCUgLyAodmFyKC0teW03dUJCdUwpIC0gMSkpKQptaW4oMTAwJSwgY2FsYygodmFyKC0teW03dUJCdUspICsgMSkgKiAxMDAlIC8gKHZhcigtLXltN3VCQnVMKSAtIDEpKSk7Cn0ueW03dUJCdU0gewogIGxlZnQ6IHZhcigtLXltN3VCQnVOKTsKICByaWdodDogdmFyKC0teW03dUJCdU8pOwogIEBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkgewogICAgbGVmdDogMDsKICAgIHJpZ2h0OiAwOwogIH0KICBAbWVkaWEgKG1pbi13aWR0aDogMTAyNXB4KSB7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh2YXIoLS15bTd1QkJ1TiksIHZhcigtLXltN3VCQnVPKSk7CiAgfQp9";
// Identical prop arrow used in two declarations
const TwiceSameArrow = /*YAK Extracted CSS:
.ym7uBBu {
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
.ym7uBBu2 {
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
.ym7uBBu4 {
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
.ym7uBBu6 {
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
.ym7uBBu9 {
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
.ym7uBBuB {
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
.ym7uBBuE {
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
.ym7uBBuG {
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
.ym7uBBuJ {
  animation-range: max(0%, calc((var(--ym7uBBuK) - 1) * 100% / (var(--ym7uBBuL) - 1)))
min(100%, calc((var(--ym7uBBuK) + 1) * 100% / (var(--ym7uBBuL) - 1)));
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuJ", {
    "style": {
        "--ym7uBBuK": ({ $index })=>$index,
        "--ym7uBBuL": ({ $slideCount })=>$slideCount
    }
});
const Nested = /*YAK Extracted CSS:
.ym7uBBuM {
  left: var(--ym7uBBuN);
  right: var(--ym7uBBuO);
  @media (min-width: 768px) {
    left: 0;
    right: 0;
  }
  @media (min-width: 1025px) {
    transform: translate(var(--ym7uBBuN), var(--ym7uBBuO));
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuM", {
    "style": {
        "--ym7uBBuN": /*#__PURE__*/ __yak_unitPostFix(({ $x })=>{
            return $x;
        }, "px"),
        "--ym7uBBuO": /*#__PURE__*/ __yak_unitPostFix(({ $y })=>$y, "px")
    }
});
