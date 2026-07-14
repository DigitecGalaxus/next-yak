import React, { memo } from "react";
import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUxIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnUyIHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1MyB7CiAgZm9udC1zaXplOiAycmVtOwp9LnltN3VCQnU0IHsKICBjb2xvcjogdmFyKC0teW03dUJCdTUpOwp9LnltN3VCQnU2IHsKICBjb2xvcjogZ3JlZW47Cn0ueW03dUJCdTcgewogIGNvbG9yOiB5ZWxsb3c7Cn0ueW03dUJCdTggewogIGNvbG9yOiBzaWx2ZXI7Cn0ueW03dUJCdTkgewogIGNvbG9yOiBnb2xkOwp9LnltN3VCQnVBIHsKICBjb2xvcjogaXZvcnk7Cn0ueW03dUJCdUIgewogIGNvbG9yOiBwaW5rOwp9LnltN3VCQnVDIHsKICBjb2xvcjogcGVydTsKfS55bTd1QkJ1RCB7CiAgY29sb3I6IHBsdW07Cn0ueW03dUJCdUUgewogIGNvbG9yOiBncmF5Owp9LnltN3VCQnVGIHsKICBjb2xvcjogdGVhbDsKfS55bTd1QkJ1RyB7CiAgY29sb3I6IGJyb3duOwp9LnltN3VCQnVIIHsKICBiYWNrZ3JvdW5kOiB3aGl0ZTsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVJIHsKICBjb2xvcjogb3JhbmdlOwp9LnltN3VCQnVKIHsKICBjb2xvcjogb2xpdmU7Cn0ueW03dUJCdUsgewogIGNvbG9yOiBjcmltc29uOwp9LnltN3VCQnVMIHsKICBjb2xvcjogbmF2eTsKfQ==";
const someRef = {
    current: null
} as any;
const props = {} as any;
const mixin = /*#__PURE__*/ css();
// folds
const Card = /*YAK Extracted CSS:
.ym7uBBu1 {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1");
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
.ym7uBBu2 {
  color: blue;
}
*/ /*#__PURE__*/ styled("section")("ym7uBBu2");
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:ym7uBBu3*//*YAK Extracted CSS:
.ym7uBBu3 {
  font-size: 2rem;
}
*/ /*#__PURE__*/ __yak.__yak_h1("ym7uBBu3");
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
.ym7uBBu4 {
  color: var(--ym7uBBu5);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4", {
    "style": {
        "--ym7uBBu5": ({ $color })=>$color
    }
});
// bails: attrs
const WithAttrs = /*YAK Extracted CSS:
.ym7uBBu6 {
  color: green;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBu6");
// folds to the wrapped component: <Extended> becomes <Card className="...">
const Extended = /*YAK Extracted CSS:
.ym7uBBu7 {
  color: yellow;
}
*/ /*#__PURE__*/ styled(Card)("ym7uBBu7");
// folds although the wrapped component comes from another file
const ExtendedImport = /*YAK Extracted CSS:
.ym7uBBu8 {
  color: silver;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBu8");
// bails: a lowercase name would be parsed as an intrinsic element in JSX
const lowercaseComponent = (p: any)=><i {...p}/>;
const ExtendedLowercase = /*YAK Extracted CSS:
.ym7uBBu9 {
  color: gold;
}
*/ /*#__PURE__*/ styled(lowercaseComponent)("ym7uBBu9");
// bails: the wrapped component binding can be reassigned
let MutableTarget = (p: any)=><b {...p}/>;
const ExtendedMutable = /*YAK Extracted CSS:
.ym7uBBuA {
  color: ivory;
}
*/ /*#__PURE__*/ styled(MutableTarget)("ym7uBBuA");
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
.ym7uBBuB {
  color: pink;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuB");
// bails: var redeclaration - both declarations share a single binding
var Redeclared = /*YAK Extracted CSS:
.ym7uBBuC {
  color: peru;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuC");
var Redeclared = /*YAK Extracted CSS:
.ym7uBBuD {
  color: plum;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBuD");
// folds although the declaration comes after the usage
const Early = ()=><p className="ym7uBBuE">before declaration</p>;
const Late = /*YAK Extracted CSS:
.ym7uBBuE {
  color: gray;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBuE");
// bails: wrapped in an HOC - folding would drop the wrapper
const Memoized = memo(/*YAK Extracted CSS:
.ym7uBBuF {
  color: teal;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuF"));
// folds: type casts are unwrapped
const Cast = /*YAK Extracted CSS:
.ym7uBBuG {
  color: brown;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuG") as unknown as typeof Card;
const BoxWithMixin = /*YAK Extracted CSS:
.ym7uBBuH {
  background: white;
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuH");
const Optimizable = ({ active }: {
    active?: boolean;
})=><>
    <div className="ym7uBBu1">folds</div>
    <div style={{
        margin: 1
    }} onClick={()=>{}} ref={someRef} data-x="1" className="ym7uBBu1">
      forwards attributes
    </div>
    <div className="ym7uBBu1 user">static class name merge</div>
    <div className={__yak_mergeClassNames("ym7uBBu1", active && "active")}>runtime class name merge</div>
    <div $foo="forwarded" className="ym7uBBu1">$props are not filtered</div>
    <div className={/*YAK Extracted CSS:
.ym7uBBuI {
  color: orange;
}
*/ /*#__PURE__*/ "ym7uBBu1 ym7uBBuI"}>
      css prop merge
    </div>
    <div className="ym7uBBu1">
      <section className="ym7uBBu2"/>
    </div>
    <h1 className="ym7uBBu3">folds</h1>
    <div className="ym7uBBuG">folds through the type cast</div>
    <Card className="ym7uBBu7">folds to the wrapped component</Card>
    <Card className="ym7uBBu7 user">merges into the wrapped component</Card>
    <ImportedCard className="ym7uBBu8">folds to the imported component</ImportedCard>
    <div className="ym7uBBuH">folds with mixin</div>
  </>;
// bails: wrapped in React.memo - the HOC result must not fold to a bare DOM element
const ReactMemoized = React.memo(/*YAK Extracted CSS:
.ym7uBBuJ {
  color: olive;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuJ"));
// bails: conditional initializer - the branch is only known at runtime
const Conditional = props.flag ? /*YAK Extracted CSS:
.ym7uBBuK {
  color: crimson;
}
*/ /*#__PURE__*/ __yak.__yak_a("ym7uBBuK") : /*YAK Extracted CSS:
.ym7uBBuL {
  color: navy;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuL");
const NotOptimizable = ()=><>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Card<any>>bails: type arguments</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <ExtendedLowercase>bails: lowercase wrapped component</ExtendedLowercase>
    <ExtendedMutable>bails: reassignable wrapped component</ExtendedMutable>
    <Mutable>bails</Mutable>
    <Redeclared>bails: var redeclaration</Redeclared>
    <Memoized>bails: HOC wrapper</Memoized>
    <ReactMemoized>bails: HOC wrapper</ReactMemoized>
    <Conditional>bails: conditional initializer</Conditional></>;
const Shadowed = ()=>{
    const Card = (p: any)=><span {...p}/>;
    return <Card>bails: shadowed local</Card>;
};
