import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiBibGFjazsKfQoueW03dUJCdTEgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTMgewogIGNvbG9yOiByZWQ7Cn0KLnltN3VCQnU0IHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1NiB7CiAgY3Vyc29yOiBwb2ludGVyOwp9LnltN3VCQnU3IHsKICBjb2xvcjogZ3JlZW47Cn0ueW03dUJCdTggewogIHBhZGRpbmc6IDRweDsKfS55bTd1QkJ1OSB7CiAgY29sb3I6IGJsdWU7Cn0ueW03dUJCdUEgewogIGNvbG9yOiB0ZWFsOwp9";
const on = Math.random() > 0.5;
const props = {} as any;
const cn = (value: unknown)=>String(value);
const x = {};
const f = ()=>Math.random() > 0.5;
const g = ()=>"id-value";
// dynamic component: a class-toggling $prop drives the conditional class
const Toggle = /*YAK Extracted CSS:
.ym7uBBu {
  color: black;
}
.ym7uBBu1 {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu", ({ $on })=>$on && /*#__PURE__*/ css("ym7uBBu1"));
// dynamic component reading two $props, to place an impure obstacle between the
// bound props
const Range = /*YAK Extracted CSS:
.ym7uBBu3 {
  color: red;
}
.ym7uBBu4 {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu2", ({ $a })=>$a && /*#__PURE__*/ css("ym7uBBu3"), ({ $b })=>$b && /*#__PURE__*/ css("ym7uBBu4"));
// dynamic component whose condition reads a non-$ prop that also stays on the
// DOM element
const ActionButton = /*YAK Extracted CSS:
.ym7uBBu6 {
  cursor: pointer;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu5", ({ disabled })=>!disabled && /*#__PURE__*/ css("ym7uBBu6"));
// static component for the plain className merges
const Card = /*YAK Extracted CSS:
.ym7uBBu7 {
  color: green;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu7");
// collapses: parent Card is a same-file static component
const Fancy = /*YAK Extracted CSS:
.ym7uBBu8 {
  padding: 4px;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu7 ym7uBBu8");
// bails: an .attrs() chain is never registered as foldable
const WithAttrs = /*YAK Extracted CSS:
.ym7uBBu9 {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_input.attrs({
    type: "text"
})("ym7uBBu9");
// bails: a let binding can be reassigned, so its usages keep the runtime path
let Mutable = /*YAK Extracted CSS:
.ym7uBBuA {
  color: teal;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBuA");
const Cases = ()=><>
    { /* boolean shorthand $prop resolves to true */ }
    <button className={"ym7uBBu" + (true ? " ym7uBBu1" : "")}>shorthand</button>

    { /* $prop bound from an impure value: ClassNameIife, only the class sees it */ }
    <button className={((__yak_$on)=>"ym7uBBu" + (__yak_$on ? " ym7uBBu1" : ""))(f())}>bound transient prop</button>

    { /* an impure attr after the only bound $prop sits outside the class slot
        span, so the cheap ClassNameIife shape holds */ }
    <button className={((__yak_$on)=>"ym7uBBu" + (__yak_$on ? " ym7uBBu1" : ""))(f())} id={g()}>
      obstacle outside the span stays cheap
    </button>

    { /* an impure attr between two bound $props cannot be jumped: element wrap */ }
    {((__yak_$a, __yak_id, __yak_$b)=><span id={__yak_id} className={"ym7uBBu2" + (__yak_$a ? " ym7uBBu3" : "") + (__yak_$b ? " ym7uBBu4" : "")}>
      obstacle between props forces the wrap
    </span>)(f(), g(), f())}

    { /* a bound non-$ prop stays on the element and reaches the class: element wrap */ }
    {((__yak_disabled)=><button disabled={__yak_disabled} className={"ym7uBBu5" + (!__yak_disabled ? " ym7uBBu6" : "")}>disabled forces the wrap</button>)(f())}

    { /* runtime className value merges with the dynamic class via mergeClassNames */ }
    <button className={__yak_mergeClassNames("ym7uBBu" + (on ? " ym7uBBu1" : ""), cn(x))}>
      runtime className merge
    </button>

    { /* a className that ran before the bound prop wraps the element */ }
    {((__yak_className, __yak_$on)=><button className={__yak_mergeClassNames("ym7uBBu" + (__yak_$on ? " ym7uBBu1" : ""), __yak_className)}>
      className composes before the prop
    </button>)(cn(x), f())}

    { /* static component: a string className merges at compile time */ }
    <div className={"ym7uBBu7 user"}>static merge</div>

    { /* the chain collapses, so the usage folds to a plain div */ }
    <div className={"ym7uBBu7 ym7uBBu8 extra"}>wrapper fold</div>

    { /* bails: the spread renders the collapsed Fancy declaration at runtime */ }
    <Fancy {...props}>spread bail</Fancy>

    { /* bails: a spread after className may carry className/style at runtime */ }
    <Card className="x" {...props}>
      spread bail
    </Card>

    { /* bails: theme is deleted before the DOM */ }
    <Card theme={props.theme}>theme bail</Card>

    { /* bails: attrs component keeps its wrapper */ }
    <WithAttrs>attrs bail</WithAttrs>

    { /* bails: reassignable binding keeps its wrapper */ }
    <Mutable>let bail</Mutable>
  </>;
