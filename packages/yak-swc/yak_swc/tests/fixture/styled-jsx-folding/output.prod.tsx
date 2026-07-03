import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const someRef = {
    current: null
} as any;
const props = {} as any;
// folds
const Card = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ styled("section")("ym7uBBu1");
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:ym7uBBu2*//*YAK Extracted CSS:
:global(.ym7uBBu2) {
  font-size: 2rem;
}
*/ /*#__PURE__*/ __yak.__yak_h1("ym7uBBu2");
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: var(--ym7uBBu4);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3", {
    "style": {
        "--ym7uBBu4": ({ $color })=>$color
    }
});
// bails: attrs
const WithAttrs = /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  color: green;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBu5");
// bails: styled(Component)
const Extended = /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: yellow;
}
*/ /*#__PURE__*/ styled(Card)("ym7uBBu6");
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: pink;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu7");
// folds although the declaration comes after the usage
const Early = ()=><p className="ym7uBBu8">before declaration</p>;
const Late = /*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: gray;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu8");
const Optimizable = ({ active }: {
    active?: boolean;
})=><>
    <div className="ym7uBBu">folds</div>
    <div style={{
        margin: 1
    }} onClick={()=>{}} ref={someRef} data-x="1" className="ym7uBBu">
      forwards attributes
    </div>
    <div className="ym7uBBu user">static class name merge</div>
    <div className={__yak_mergeClassNames("ym7uBBu", active && "active")}>runtime class name merge</div>
    <div $foo="forwarded" className="ym7uBBu">$props are not filtered</div>
    <div className={/*YAK Extracted CSS:
:global(.ym7uBBu9) {
  color: orange;
}
*/ /*#__PURE__*/ "ym7uBBu ym7uBBu9"}>
      css prop merge
    </div>
    <div className="ym7uBBu">
      <section className="ym7uBBu1"/>
    </div>
    <h1 className="ym7uBBu2">folds</h1>
  </>;
const NotOptimizable = ()=><>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Card<any>>bails: type arguments</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <Extended>bails</Extended>
    <Mutable>bails</Mutable></>;
const Shadowed = ()=>{
    const Card = (p: any)=><span {...p}/>;
    return <Card>bails: shadowed local</Card>;
};
