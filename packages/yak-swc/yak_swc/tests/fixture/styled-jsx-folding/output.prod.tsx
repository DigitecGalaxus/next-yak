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
:global(.ym7uBBu1) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1");
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  color: blue;
}
*/ /*#__PURE__*/ styled("section")("ym7uBBu2");
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:ym7uBBu3*//*YAK Extracted CSS:
:global(.ym7uBBu3) {
  font-size: 2rem;
}
*/ /*#__PURE__*/ __yak.__yak_h1("ym7uBBu3");
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: var(--ym7uBBu5);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu4", {
    "style": {
        "--ym7uBBu5": ({ $color })=>$color
    }
});
// bails: attrs
const WithAttrs = /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: green;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBu6");
// collapses: parent is a same-file static component
const Extended = /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: yellow;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1 ym7uBBu7");
// collapses: three-level chain, classes merged parent-first
const ExtendedTwice = /*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: coral;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu1 ym7uBBu7 ym7uBBu8");
// collapses: exported chain keeps its folded declaration
export const FancyTitle = /*YAK EXPORTED STYLED:FancyTitle:ym7uBBu9*//*YAK Extracted CSS:
:global(.ym7uBBu9) {
  letter-spacing: 1px;
}
*/ /*#__PURE__*/ __yak.__yak_h1("ym7uBBu3 ym7uBBu9");
// folds to the wrapped component: a cross-file parent never collapses
const ExtendedImport = /*YAK Extracted CSS:
:global(.ym7uBBuA) {
  color: silver;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBuA");
// dynamic: class-toggling condition
const ToggleBase = /*YAK Extracted CSS:
:global(.ym7uBBuC) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuB", ({ $on })=>$on && /*#__PURE__*/ css("ym7uBBuC"));
// folds to the wrapped component: a dynamic parent never collapses
const OfDynamic = /*YAK Extracted CSS:
:global(.ym7uBBuD) {
  color: teal;
}
*/ /*#__PURE__*/ styled(ToggleBase)("ym7uBBuD");
// folds to the wrapped component: an attrs parent never collapses
const OfAttrs = /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: maroon;
}
*/ /*#__PURE__*/ styled(WithAttrs)("ym7uBBuE");
// bails: a lowercase name would be parsed as an intrinsic element in JSX
const lowercaseComponent = (p: any)=><i {...p}/>;
const ExtendedLowercase = /*YAK Extracted CSS:
:global(.ym7uBBuF) {
  color: gold;
}
*/ /*#__PURE__*/ styled(lowercaseComponent)("ym7uBBuF");
// bails: the wrapped component binding can be reassigned
let MutableTarget = (p: any)=><b {...p}/>;
const ExtendedMutable = /*YAK Extracted CSS:
:global(.ym7uBBuG) {
  color: ivory;
}
*/ /*#__PURE__*/ styled(MutableTarget)("ym7uBBuG");
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
:global(.ym7uBBuH) {
  color: pink;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuH");
// bails: a let parent keeps the whole chain on the runtime path
const OfLet = /*YAK Extracted CSS:
:global(.ym7uBBuI) {
  color: khaki;
}
*/ /*#__PURE__*/ styled(Mutable)("ym7uBBuI");
// bails: parent declared after the child (const temporal dead zone) - collapsing
// would turn the guaranteed ReferenceError into silently working output
const OfLater = /*YAK Extracted CSS:
:global(.ym7uBBuJ) {
  color: wheat;
}
*/ /*#__PURE__*/ styled(Later)("ym7uBBuJ");
const Later = /*YAK Extracted CSS:
:global(.ym7uBBuK) {
  color: linen;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuK");
// bails: var redeclaration - both declarations share a single binding
var Redeclared = /*YAK Extracted CSS:
:global(.ym7uBBuL) {
  color: peru;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuL");
var Redeclared = /*YAK Extracted CSS:
:global(.ym7uBBuM) {
  color: plum;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBuM");
// folds although the declaration comes after the usage
const Early = ()=><p className="ym7uBBuN">before declaration</p>;
const Late = /*YAK Extracted CSS:
:global(.ym7uBBuN) {
  color: gray;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBuN");
// bails: wrapped in an HOC - folding would drop the wrapper
const Memoized = memo(/*YAK Extracted CSS:
:global(.ym7uBBuO) {
  color: teal;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuO"));
// folds: type casts are unwrapped
const Cast = /*YAK Extracted CSS:
:global(.ym7uBBuP) {
  color: brown;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuP") as unknown as typeof Card;
const BoxWithMixin = /*YAK Extracted CSS:
:global(.ym7uBBuQ) {
  background: white;
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuQ");
const Optimizable = ({ active }: {
    active?: boolean;
})=><>
    <div className="ym7uBBu1">folds</div>
    <div style={{
        margin: 1
    }} onClick={()=>{}} ref={someRef} data-x="1" className="ym7uBBu1">
      forwards attributes
    </div>
    <div className={"ym7uBBu1 user"}>static class name merge</div>
    <div className={__yak_mergeClassNames("ym7uBBu1", active && "active")}>runtime class name merge</div>
    <div $foo="forwarded" className="ym7uBBu1">$props are not filtered</div>
    <div className={/*YAK Extracted CSS:
:global(.ym7uBBuR) {
  color: orange;
}
*/ /*#__PURE__*/ "ym7uBBu1 ym7uBBuR"}>
      css prop merge
    </div>
    <div className="ym7uBBu1">
      <section className="ym7uBBu2"/>
    </div>
    <h1 className="ym7uBBu3">folds</h1>
    <div className="ym7uBBuP">folds through the type cast</div>
    <div className="ym7uBBu1 ym7uBBu7">collapses to a plain div</div>
    <div className={"ym7uBBu1 ym7uBBu7 user"}>collapses and merges the className</div>
    <div className="ym7uBBu1 ym7uBBu7 ym7uBBu8">collapses the whole three-level chain</div>
    <h1 className="ym7uBBu3 ym7uBBu9">collapses the exported chain</h1>
    <ToggleBase className="ym7uBBuD">folds to the dynamic parent, chain not collapsed</ToggleBase>
    <WithAttrs className="ym7uBBuE">folds to the attrs parent, chain not collapsed</WithAttrs>
    <Later className="ym7uBBuJ">folds to the later-declared parent, chain not collapsed</Later>
    <ImportedCard className="ym7uBBuA">folds to the imported component</ImportedCard>
    <div className="ym7uBBuQ">folds with mixin</div>
  </>;
// bails: wrapped in React.memo - the HOC result must not fold to a bare DOM element
const ReactMemoized = React.memo(/*YAK Extracted CSS:
:global(.ym7uBBuS) {
  color: olive;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuS"));
// bails: conditional initializer - the branch is only known at runtime
const Conditional = props.flag ? /*YAK Extracted CSS:
:global(.ym7uBBuT) {
  color: crimson;
}
*/ /*#__PURE__*/ __yak.__yak_a("ym7uBBuT") : /*YAK Extracted CSS:
:global(.ym7uBBuU) {
  color: navy;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuU");
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
