import React, { memo } from "react";
import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const someRef = {
    current: null
} as any;
const props = {} as any;
const mixin = /*#__PURE__*/ css();
// folds
const Card = /*YAK Extracted CSS:
:global(.input_Card_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu"), {
    "displayName": "Card"
});
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
:global(.input_Box_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled("section")("input_Box_m7uBBu"), {
    "displayName": "Box"
});
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:input_Title_m7uBBu*//*YAK Extracted CSS:
:global(.input_Title_m7uBBu) {
  font-size: 2rem;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu"), {
    "displayName": "Title"
});
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
:global(.input_Dynamic_m7uBBu) {
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
:global(.input_WithAttrs_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("input_WithAttrs_m7uBBu"), {
    "displayName": "WithAttrs"
});
// folds to the wrapped component: <Extended> becomes <Card className="...">
const Extended = /*YAK Extracted CSS:
:global(.input_Extended_m7uBBu) {
  color: yellow;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Card)("input_Extended_m7uBBu"), {
    "displayName": "Extended"
});
// folds although the wrapped component comes from another file
const ExtendedImport = /*YAK Extracted CSS:
:global(.input_ExtendedImport_m7uBBu) {
  color: silver;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(ImportedCard)("input_ExtendedImport_m7uBBu"), {
    "displayName": "ExtendedImport"
});
// bails: a lowercase name would be parsed as an intrinsic element in JSX
const lowercaseComponent = (p: any)=><i {...p}/>;
const ExtendedLowercase = /*YAK Extracted CSS:
:global(.input_ExtendedLowercase_m7uBBu) {
  color: gold;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(lowercaseComponent)("input_ExtendedLowercase_m7uBBu"), {
    "displayName": "ExtendedLowercase"
});
// bails: the wrapped component binding can be reassigned
let MutableTarget = (p: any)=><b {...p}/>;
const ExtendedMutable = /*YAK Extracted CSS:
:global(.input_ExtendedMutable_m7uBBu) {
  color: ivory;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(MutableTarget)("input_ExtendedMutable_m7uBBu"), {
    "displayName": "ExtendedMutable"
});
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
:global(.input_Mutable_m7uBBu) {
  color: pink;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Mutable_m7uBBu"), {
    "displayName": "Mutable"
});
// folds although the declaration comes after the usage
const Early = ()=><p className="input_Late_m7uBBu">before declaration</p>;
const Late = /*YAK Extracted CSS:
:global(.input_Late_m7uBBu) {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Late_m7uBBu"), {
    "displayName": "Late"
});
// bails: wrapped in an HOC - folding would drop the wrapper
const Memoized = memo(/*YAK Extracted CSS:
:global(.input_Memoized_m7uBBu) {
  color: teal;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Memoized_m7uBBu"), {
    "displayName": "Memoized"
}));
// folds: type casts are unwrapped
const Cast = /*YAK Extracted CSS:
:global(.input_Cast_m7uBBu) {
  color: brown;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Cast_m7uBBu"), {
    "displayName": "Cast"
}) as unknown as typeof Card;
const BoxWithMixin = /*YAK Extracted CSS:
:global(.input_BoxWithMixin_m7uBBu) {
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
:global(.input_Optimizable_m7uBBu) {
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
    <Card className="input_Extended_m7uBBu">folds to the wrapped component</Card>
    <Card className="input_Extended_m7uBBu user">merges into the wrapped component</Card>
    <ImportedCard className="input_ExtendedImport_m7uBBu">folds to the imported component</ImportedCard>
    <div className="input_BoxWithMixin_m7uBBu">folds with mixin</div>
  </>;
// bails: wrapped in React.memo - the HOC result must not fold to a bare DOM element
const ReactMemoized = React.memo(/*YAK Extracted CSS:
:global(.input_ReactMemoized_m7uBBu) {
  color: olive;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ReactMemoized_m7uBBu"), {
    "displayName": "ReactMemoized"
}));
// bails: conditional initializer - the branch is only known at runtime
const Conditional = props.flag ? /*YAK Extracted CSS:
:global(.input_Conditional_m7uBBu) {
  color: crimson;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_a("input_Conditional_m7uBBu"), {
    "displayName": "Conditional"
}) : /*YAK Extracted CSS:
:global(.input_Conditional_m7uBBu-01) {
  color: navy;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Conditional_m7uBBu-01"), {
    "displayName": "Conditional"
});
const NotOptimizable = ()=><>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Card<any>>bails: type arguments</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <ExtendedLowercase>bails: lowercase wrapped component</ExtendedLowercase>
    <ExtendedMutable>bails: reassignable wrapped component</ExtendedMutable>
    <Mutable>bails</Mutable>
    <Memoized>bails: HOC wrapper</Memoized>
    <ReactMemoized>bails: HOC wrapper</ReactMemoized>
    <Conditional>bails: conditional initializer</Conditional></>;
const Shadowed = ()=>{
    const Card = (p: any)=><span {...p}/>;
    return <Card>bails: shadowed local</Card>;
};
