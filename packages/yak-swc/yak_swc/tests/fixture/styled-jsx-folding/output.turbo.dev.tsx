import React, { memo } from "react";
import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0NhcmRfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X0JveF9tN3VCQnUgewogIGNvbG9yOiBibHVlOwp9LmlucHV0X1RpdGxlX203dUJCdSB7CiAgZm9udC1zaXplOiAycmVtOwp9LmlucHV0X0R5bmFtaWNfbTd1QkJ1IHsKICBjb2xvcjogdmFyKC0taW5wdXRfRHluYW1pY19fY29sb3JfbTd1QkJ1KTsKfS5pbnB1dF9XaXRoQXR0cnNfbTd1QkJ1IHsKICBjb2xvcjogZ3JlZW47Cn0uaW5wdXRfRXh0ZW5kZWRfbTd1QkJ1IHsKICBjb2xvcjogeWVsbG93Owp9LmlucHV0X0V4dGVuZGVkVHdpY2VfbTd1QkJ1IHsKICBjb2xvcjogY29yYWw7Cn0uaW5wdXRfRmFuY3lUaXRsZV9tN3VCQnUgewogIGxldHRlci1zcGFjaW5nOiAxcHg7Cn0uaW5wdXRfRXh0ZW5kZWRJbXBvcnRfbTd1QkJ1IHsKICBjb2xvcjogc2lsdmVyOwp9LmlucHV0X1RvZ2dsZUJhc2VfX1wkb25fbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X09mRHluYW1pY19tN3VCQnUgewogIGNvbG9yOiB0ZWFsOwp9LmlucHV0X09mQXR0cnNfbTd1QkJ1IHsKICBjb2xvcjogbWFyb29uOwp9LmlucHV0X0V4dGVuZGVkTG93ZXJjYXNlX203dUJCdSB7CiAgY29sb3I6IGdvbGQ7Cn0uaW5wdXRfRXh0ZW5kZWRNdXRhYmxlX203dUJCdSB7CiAgY29sb3I6IGl2b3J5Owp9LmlucHV0X011dGFibGVfbTd1QkJ1IHsKICBjb2xvcjogcGluazsKfS5pbnB1dF9PZkxldF9tN3VCQnUgewogIGNvbG9yOiBraGFraTsKfS5pbnB1dF9PZkxhdGVyX203dUJCdSB7CiAgY29sb3I6IHdoZWF0Owp9LmlucHV0X0xhdGVyX203dUJCdSB7CiAgY29sb3I6IGxpbmVuOwp9LmlucHV0X1JlZGVjbGFyZWRfbTd1QkJ1IHsKICBjb2xvcjogcGVydTsKfS5pbnB1dF9SZWRlY2xhcmVkX203dUJCdS0wMSB7CiAgY29sb3I6IHBsdW07Cn0uaW5wdXRfTGF0ZV9tN3VCQnUgewogIGNvbG9yOiBncmF5Owp9LmlucHV0X01lbW9pemVkX203dUJCdSB7CiAgY29sb3I6IHRlYWw7Cn0uaW5wdXRfQ2FzdF9tN3VCQnUgewogIGNvbG9yOiBicm93bjsKfS5pbnB1dF9Cb3hXaXRoTWl4aW5fbTd1QkJ1IHsKICBiYWNrZ3JvdW5kOiB3aGl0ZTsKICBjb2xvcjogcmVkOwp9LmlucHV0X09wdGltaXphYmxlX203dUJCdSB7CiAgY29sb3I6IG9yYW5nZTsKfS5pbnB1dF9SZWFjdE1lbW9pemVkX203dUJCdSB7CiAgY29sb3I6IG9saXZlOwp9LmlucHV0X0NvbmRpdGlvbmFsX203dUJCdSB7CiAgY29sb3I6IGNyaW1zb247Cn0uaW5wdXRfQ29uZGl0aW9uYWxfbTd1QkJ1LTAxIHsKICBjb2xvcjogbmF2eTsKfQ==";
const someRef = {
    current: null
} as any;
const props = {} as any;
const mixin = /*#__PURE__*/ css();
// folds
const Card = /*YAK Extracted CSS:
.input_Card_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu"), {
    "displayName": "Card"
});
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
.input_Box_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled("section")("input_Box_m7uBBu"), {
    "displayName": "Box"
});
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:input_Title_m7uBBu*//*YAK Extracted CSS:
.input_Title_m7uBBu {
  font-size: 2rem;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu"), {
    "displayName": "Title"
});
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
.input_Dynamic_m7uBBu {
  color: var(--input_Dynamic__color_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Dynamic_m7uBBu", {
    "style": {
        "--input_Dynamic__color_m7uBBu": ({ $color })=>$color
    }
}), {
    "displayName": "Dynamic"
});
// bails: attrs
const WithAttrs = /*YAK Extracted CSS:
.input_WithAttrs_m7uBBu {
  color: green;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("input_WithAttrs_m7uBBu"), {
    "displayName": "WithAttrs"
});
// collapses: parent is a same-file static component
const Extended = /*YAK Extracted CSS:
.input_Extended_m7uBBu {
  color: yellow;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu input_Extended_m7uBBu"), {
    "displayName": "Extended"
});
// collapses: three-level chain, classes merged parent-first
const ExtendedTwice = /*YAK Extracted CSS:
.input_ExtendedTwice_m7uBBu {
  color: coral;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu input_Extended_m7uBBu input_ExtendedTwice_m7uBBu"), {
    "displayName": "ExtendedTwice"
});
// collapses: exported chain keeps its folded declaration
export const FancyTitle = /*YAK EXPORTED STYLED:FancyTitle:input_FancyTitle_m7uBBu*//*YAK Extracted CSS:
.input_FancyTitle_m7uBBu {
  letter-spacing: 1px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu input_FancyTitle_m7uBBu"), {
    "displayName": "FancyTitle"
});
// folds to the wrapped component: a cross-file parent never collapses
const ExtendedImport = /*YAK Extracted CSS:
.input_ExtendedImport_m7uBBu {
  color: silver;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(ImportedCard)("input_ExtendedImport_m7uBBu"), {
    "displayName": "ExtendedImport"
});
// dynamic: class-toggling condition
const ToggleBase = /*YAK Extracted CSS:
.input_ToggleBase__\$on_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ToggleBase_m7uBBu", ({ $on })=>$on && /*#__PURE__*/ css("input_ToggleBase__$on_m7uBBu")), {
    "displayName": "ToggleBase"
});
// folds to the wrapped component: a dynamic parent never collapses
const OfDynamic = /*YAK Extracted CSS:
.input_OfDynamic_m7uBBu {
  color: teal;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(ToggleBase)("input_OfDynamic_m7uBBu"), {
    "displayName": "OfDynamic"
});
// folds to the wrapped component: an attrs parent never collapses
const OfAttrs = /*YAK Extracted CSS:
.input_OfAttrs_m7uBBu {
  color: maroon;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(WithAttrs)("input_OfAttrs_m7uBBu"), {
    "displayName": "OfAttrs"
});
// bails: a lowercase name would be parsed as an intrinsic element in JSX
const lowercaseComponent = (p: any)=><i {...p}/>;
const ExtendedLowercase = /*YAK Extracted CSS:
.input_ExtendedLowercase_m7uBBu {
  color: gold;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(lowercaseComponent)("input_ExtendedLowercase_m7uBBu"), {
    "displayName": "ExtendedLowercase"
});
// bails: the wrapped component binding can be reassigned
let MutableTarget = (p: any)=><b {...p}/>;
const ExtendedMutable = /*YAK Extracted CSS:
.input_ExtendedMutable_m7uBBu {
  color: ivory;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(MutableTarget)("input_ExtendedMutable_m7uBBu"), {
    "displayName": "ExtendedMutable"
});
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
.input_Mutable_m7uBBu {
  color: pink;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Mutable_m7uBBu"), {
    "displayName": "Mutable"
});
// bails: a let parent keeps the whole chain on the runtime path
const OfLet = /*YAK Extracted CSS:
.input_OfLet_m7uBBu {
  color: khaki;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Mutable)("input_OfLet_m7uBBu"), {
    "displayName": "OfLet"
});
// bails: parent declared after the child (const temporal dead zone) - collapsing
// would turn the guaranteed ReferenceError into silently working output
const OfLater = /*YAK Extracted CSS:
.input_OfLater_m7uBBu {
  color: wheat;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Later)("input_OfLater_m7uBBu"), {
    "displayName": "OfLater"
});
const Later = /*YAK Extracted CSS:
.input_Later_m7uBBu {
  color: linen;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Later_m7uBBu"), {
    "displayName": "Later"
});
// bails: var redeclaration - both declarations share a single binding
var Redeclared = /*YAK Extracted CSS:
.input_Redeclared_m7uBBu {
  color: peru;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Redeclared_m7uBBu"), {
    "displayName": "Redeclared"
});
var Redeclared = /*YAK Extracted CSS:
.input_Redeclared_m7uBBu-01 {
  color: plum;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Redeclared_m7uBBu-01"), {
    "displayName": "Redeclared"
});
// folds although the declaration comes after the usage
const Early = ()=><p className="input_Late_m7uBBu">before declaration</p>;
const Late = /*YAK Extracted CSS:
.input_Late_m7uBBu {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Late_m7uBBu"), {
    "displayName": "Late"
});
// bails: wrapped in an HOC - folding would drop the wrapper
const Memoized = memo(/*YAK Extracted CSS:
.input_Memoized_m7uBBu {
  color: teal;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Memoized_m7uBBu"), {
    "displayName": "Memoized"
}));
// folds: type casts are unwrapped
const Cast = /*YAK Extracted CSS:
.input_Cast_m7uBBu {
  color: brown;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Cast_m7uBBu"), {
    "displayName": "Cast"
}) as unknown as typeof Card;
const BoxWithMixin = /*YAK Extracted CSS:
.input_BoxWithMixin_m7uBBu {
  background: white;
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_BoxWithMixin_m7uBBu"), {
    "displayName": "BoxWithMixin"
});
const Optimizable = ({ active }: {
    active?: boolean;
})=><>
    <div className="input_Card_m7uBBu">folds</div>
    <div style={{
        margin: 1
    }} onClick={()=>{}} ref={someRef} data-x="1" className="input_Card_m7uBBu">
      forwards attributes
    </div>
    <div className="input_Card_m7uBBu user">static class name merge</div>
    <div className={__yak_mergeClassNames("input_Card_m7uBBu", active && "active")}>runtime class name merge</div>
    <div $foo="forwarded" className="input_Card_m7uBBu">$props are not filtered</div>
    <div className={/*YAK Extracted CSS:
.input_Optimizable_m7uBBu {
  color: orange;
}
*/ /*#__PURE__*/ "input_Card_m7uBBu input_Optimizable_m7uBBu"}>
      css prop merge
    </div>
    <div className="input_Card_m7uBBu">
      <section className="input_Box_m7uBBu"/>
    </div>
    <h1 className="input_Title_m7uBBu">folds</h1>
    <div className="input_Cast_m7uBBu">folds through the type cast</div>
    <div className="input_Card_m7uBBu input_Extended_m7uBBu">collapses to a plain div</div>
    <div className="input_Card_m7uBBu input_Extended_m7uBBu user">collapses and merges the className</div>
    <div className="input_Card_m7uBBu input_Extended_m7uBBu input_ExtendedTwice_m7uBBu">collapses the whole three-level chain</div>
    <h1 className="input_Title_m7uBBu input_FancyTitle_m7uBBu">collapses the exported chain</h1>
    <ToggleBase className="input_OfDynamic_m7uBBu">folds to the dynamic parent, chain not collapsed</ToggleBase>
    <WithAttrs className="input_OfAttrs_m7uBBu">folds to the attrs parent, chain not collapsed</WithAttrs>
    <Later className="input_OfLater_m7uBBu">folds to the later-declared parent, chain not collapsed</Later>
    <ImportedCard className="input_ExtendedImport_m7uBBu">folds to the imported component</ImportedCard>
    <div className="input_BoxWithMixin_m7uBBu">folds with mixin</div>
  </>;
// bails: wrapped in React.memo - the HOC result must not fold to a bare DOM element
const ReactMemoized = React.memo(/*YAK Extracted CSS:
.input_ReactMemoized_m7uBBu {
  color: olive;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ReactMemoized_m7uBBu"), {
    "displayName": "ReactMemoized"
}));
// bails: conditional initializer - the branch is only known at runtime
const Conditional = props.flag ? /*YAK Extracted CSS:
.input_Conditional_m7uBBu {
  color: crimson;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_a("input_Conditional_m7uBBu"), {
    "displayName": "Conditional"
}) : /*YAK Extracted CSS:
.input_Conditional_m7uBBu-01 {
  color: navy;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Conditional_m7uBBu-01"), {
    "displayName": "Conditional"
});
const NotOptimizable = ()=><>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <ExtendedLowercase>bails: lowercase wrapped component</ExtendedLowercase>
    <ExtendedMutable>bails: reassignable wrapped component</ExtendedMutable>
    <Mutable>bails</Mutable>
    <OfLet>bails: reassignable parent keeps the runtime chain</OfLet>
    <Redeclared>bails: var redeclaration</Redeclared>
    <Memoized>bails: HOC wrapper</Memoized>
    <ReactMemoized>bails: HOC wrapper</ReactMemoized>
    <Conditional>bails: conditional initializer</Conditional></>;
const Shadowed = ()=>{
    const Card = (p: any)=><span {...p}/>;
    return <Card>bails: shadowed local</Card>;
};
