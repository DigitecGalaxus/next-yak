import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGRpc3BsYXk6IGZsZXg7CiAgbWluLWhlaWdodDogMjRweDsKfQoueW03dUJCdTEgewogIG1hcmdpbi1yaWdodDogMTJweDsKfS55bTd1QkJ1MiB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1MyB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdTQgewogIGNvbG9yOiBibHVlOwp9Ci55bTd1QkJ1NSB7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0ueW03dUJCdTYgewogIGNvbG9yOiBncmF5Owp9Ci55bTd1QkJ1NyB7CiAgY29sb3I6IGJsYWNrOwp9LnltN3VCQnU4IHsKICBjb2xvcjogZ3JlZW47Cn0KLnltN3VCQnU5IHsKICBsaW5lLWhlaWdodDogMTsKfS55bTd1QkJ1QSB7CiAgcGFkZGluZzogMXB4Owp9Ci55bTd1QkJ1QiB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVEIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVGIHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1SCB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdUkgewogIHRvcDogMDsKfS55bTd1QkJ1SyB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1TCB7CiAgcGFkZGluZzogMXB4Owp9Ci55bTd1QkJ1TSB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVPIHsKICBwYWRkaW5nOiA4cHg7Cn0ueW03dUJCdVEgewogIHBhZGRpbmc6IDhweDsKfS55bTd1QkJ1UyB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVUIHsKICBjb2xvcjogYmx1ZTsKfQoueW03dUJCdVUgewogIGN1cnNvcjogcG9pbnRlcjsKfS55bTd1QkJ1ViB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1VyB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1WSB7CiAgd2lkdGg6IHZhcigtLXltN3VCQnVaKTsKfS55bTd1QkJ1YiB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1ZCB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1ZiB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdWcgewogIG9wYWNpdHk6IDAuNTsKfS55bTd1QkJ1aSB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1ayB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1bCB7CiAgZGlzcGxheTogaW5saW5lLWZsZXg7Cn0KLnltN3VCQnVtIHsKICBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFkNWRiOwp9Ci55bTd1QkJ1biB7CiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjRmNjsKfQoueW03dUJCdW8gewogIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50Owp9Ci55bTd1QkJ1cCB7CiAgd2lkdGg6IDEwMCU7Cn0ueW03dUJCdXIgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdXQgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdXYgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdXggewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdXogewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdS0gewogIGNvbG9yOiBvcmFuZ2U7Cn0=";
const props = {} as any;
// folds: the class-toggling expression is inlined at the usage
const IconContainer = /*YAK Extracted CSS:
.ym7uBBu {
  display: flex;
  min-height: 24px;
}
.ym7uBBu1 {
  margin-right: 12px;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu", ({ $hasChildren })=>$hasChildren && /*#__PURE__*/ css("ym7uBBu1"));
// folds: ternary mixin plus a second expression
const Many = /*YAK Extracted CSS:
.ym7uBBu2 {
  color: black;
}
.ym7uBBu3 {
  color: red;
}
.ym7uBBu4 {
  color: blue;
}
.ym7uBBu5 {
  font-weight: bold;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu2", ({ $variant })=>$variant === "primary" ? /*#__PURE__*/ css("ym7uBBu3") : /*#__PURE__*/ css("ym7uBBu4"), ({ $bold })=>$bold && /*#__PURE__*/ css("ym7uBBu5"));
// bails: function expressions bind this/arguments, which inlining would
// rebind to the enclosing component
const Fn = /*YAK Extracted CSS:
.ym7uBBu6 {
  color: gray;
}
.ym7uBBu7 {
  color: black;
}
*/ /*#__PURE__*/ __yak.__yak_i("ym7uBBu6", function({ $on }) {
    return $on && /*#__PURE__*/ css("ym7uBBu7");
});
// folds: zero-arg expressions reference the outer scope like the css prop
const isCompact = true;
const Scoped = /*YAK Extracted CSS:
.ym7uBBu8 {
  color: green;
}
.ym7uBBu9 {
  line-height: 1;
}
*/ /*#__PURE__*/ __yak.__yak_em("ym7uBBu8", ()=>isCompact && /*#__PURE__*/ css("ym7uBBu9"));
// the twice-referenced $size attribute is read at two sites, so an impure
// value would be evaluated twice - it is bound once instead
const Twice = /*YAK Extracted CSS:
.ym7uBBuA {
  padding: 1px;
}
.ym7uBBuB {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuA", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("ym7uBBuB"));
// folds: one read, inside a callback - an impure value would run once per list
// element, so a single read is enough to bind it
const sizes = [
    1,
    2,
    3
];
const InCallback = /*YAK Extracted CSS:
.ym7uBBuD {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuC", ({ $n })=>sizes.some((x)=>x > $n) && /*#__PURE__*/ css("ym7uBBuD"));
// folds: one read, behind a short circuit - an impure value would not run at
// all when the left side is falsy
const ShortCircuit = /*YAK Extracted CSS:
.ym7uBBuF {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuE", ({ $b })=>isCompact && $b && /*#__PURE__*/ css("ym7uBBuF"));
// folds: the conditions read $a before $b, the attributes pass $b first - the
// arguments follow the attributes, not the conditions
const Pair = /*YAK Extracted CSS:
.ym7uBBuH {
  color: red;
}
.ym7uBBuI {
  top: 0;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuG", ({ $a })=>$a && /*#__PURE__*/ css("ym7uBBuH"), ({ $b })=>$b && /*#__PURE__*/ css("ym7uBBuI"));
// folds: a single condition to pin what counts as safe to inline
const colors = {
    big: "red"
} as Record<string, string>;
const Boxed = /*YAK Extracted CSS:
.ym7uBBuK {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuJ", ({ $v })=>$v && /*#__PURE__*/ css("ym7uBBuK"));
// folds: an arrow returning from a block body is a condition like any other
const BlockBody = /*YAK Extracted CSS:
.ym7uBBuL {
  padding: 1px;
}
.ym7uBBuM {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_aside("ym7uBBuL", ({ $wide })=>{
    return $wide && /*#__PURE__*/ css("ym7uBBuM");
});
// usages bail: only plain destructuring substitutes - a rename, a default or a
// rest element all keep the runtime path
const Renamed = /*YAK Extracted CSS:
.ym7uBBuO {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuN", ({ $size: size })=>size && size === "big" && /*#__PURE__*/ css("ym7uBBuO"));
const Defaulted = /*YAK Extracted CSS:
.ym7uBBuQ {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuP", ({ $size = "big" })=>$size === "big" && /*#__PURE__*/ css("ym7uBBuQ"));
const Rested = /*YAK Extracted CSS:
.ym7uBBuS {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuR", ({ $size, ...rest })=>$size && rest && /*#__PURE__*/ css("ym7uBBuS"));
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
.ym7uBBuT {
  color: blue;
}
.ym7uBBuU {
  cursor: pointer;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuT", ({ disabled })=>!disabled && /*#__PURE__*/ css("ym7uBBuU"));
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
.ym7uBBuV {
  color: black;
}
.ym7uBBuW {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_strong("ym7uBBuV", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("ym7uBBuW"));
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
.ym7uBBuY {
  width: var(--ym7uBBuZ);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuX", ({ $active, $size })=>$active && /*#__PURE__*/ css("ym7uBBuY", {
        "style": {
            "--ym7uBBuZ": /*#__PURE__*/ __yak_unitPostFix(()=>$size, "px")
        }
    }));
// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = /*YAK Extracted CSS:
.ym7uBBub {
  color: red;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBua", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBub"));
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
.ym7uBBud {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBuc", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBud"));
// usages bail: a namespaced attribute is keyed by its plain name everywhere
// below, so it would evaluate on the element without ever counting as an
// obstacle the parameter block may not jump - `<use xlink:href>` is the
// sprite pattern, and svg/use/image are all foldable elements
const Sprite = /*YAK Extracted CSS:
.ym7uBBuf {
  color: red;
}
.ym7uBBug {
  opacity: 0.5;
}
*/ /*#__PURE__*/ __yak.__yak_use("ym7uBBue", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuf"), ({ $muted })=>$muted && /*#__PURE__*/ css("ym7uBBug"));
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
.ym7uBBui {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuh", ({ className })=>className && /*#__PURE__*/ css("ym7uBBui"));
// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = /*YAK Extracted CSS:
.ym7uBBuk {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuj", ({ key })=>key === "active" && /*#__PURE__*/ css("ym7uBBuk"));
// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = /*YAK Extracted CSS:
.ym7uBBul {
  display: inline-flex;
}
.ym7uBBum {
  background-color: #d1d5db;
}
.ym7uBBun {
  background-color: #f3f4f6;
}
.ym7uBBuo {
  background-color: transparent;
}
.ym7uBBup {
  width: 100%;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBul", (p)=>!p.$active && /*#__PURE__*/ css("ym7uBBum"), (p)=>p.$variant === "secondary" && /*#__PURE__*/ css("ym7uBBun"), (p)=>p.$variant === "ghost" && /*#__PURE__*/ css("ym7uBBuo"), (p)=>p.$fullWidth && /*#__PURE__*/ css("ym7uBBup"));
// usages bail: the whole props object escapes into the function call
const MemberEscape = /*YAK Extracted CSS:
.ym7uBBur {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuq", (p)=>props.calculate(p) && /*#__PURE__*/ css("ym7uBBur"));
// usages bail: theme access through the identifier param
const MemberTheme = /*YAK Extracted CSS:
.ym7uBBut {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBus", (p)=>p.theme.highContrast && p.$accent && /*#__PURE__*/ css("ym7uBBut"));
// usages bail: computed member access
const MemberComputed = /*YAK Extracted CSS:
.ym7uBBuv {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuu", (p)=>p["$active"] && /*#__PURE__*/ css("ym7uBBuv"));
// usages bail: key access through the identifier param
const MemberKey = /*YAK Extracted CSS:
.ym7uBBux {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuw", (p)=>p.key === "active" && /*#__PURE__*/ css("ym7uBBux"));
// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = /*YAK Extracted CSS:
.ym7uBBuz {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuy", (p)=>p.$active && /*#__PURE__*/ css("ym7uBBuz"));
const Optimizable = ({ active, size, i: i1 }: {
    active?: boolean;
    size?: string;
    i: number;
})=><>
    <span aria-hidden className={"ym7uBBu" + (true ? " ym7uBBu1" : "")}>
      <i/>
    </span>
    <span data-kept="yes" className={"ym7uBBu" + (active ? " ym7uBBu1" : "")}>
      inlines the attribute expression and drops all $props
    </span>
    <span className={"ym7uBBu" + (void 0 ? " ym7uBBu1" : "")}>absent $props count as undefined</span>
    <span className={"ym7uBBu" + (true ? " ym7uBBu1" : "") + " user"}>
      static class merge
    </span>
    <span className={__yak_mergeClassNames("ym7uBBu" + (true ? " ym7uBBu1" : ""), active && "on")}>
      runtime class merge
    </span>
    <span className={"ym7uBBu" + (true ? " ym7uBBu1" : "") + /*YAK Extracted CSS:
.ym7uBBu- {
  color: orange;
}
*/ /*#__PURE__*/ " ym7uBBu-"}>
      css prop merge
    </span>
    <p className={"ym7uBBu2" + ("primary" === "primary" ? " ym7uBBu3" : " ym7uBBu4") + (true ? " ym7uBBu5" : "")}>
      two inlined expressions
    </p>
    <Fn $on={active}>function form</Fn>
    <em className={"ym7uBBu8" + (isCompact ? " ym7uBBu9" : "")}>outer scope condition</em>
    <li className={"ym7uBBuA" + (size && size === "big" ? " ym7uBBuB" : "")}>safe to duplicate</li>
    <button disabled={active} className={"ym7uBBuT" + (!active ? " ym7uBBuU" : "")}>kept on the element and inlined</button>
    <button disabled className={"ym7uBBuT" + (!true ? " ym7uBBuU" : "")}>bare non-$ prop</button>
    { /* two read sites, so the value is bound once instead of rolled twice -
        the two conditions could otherwise disagree */ }
    <li className={((__yak_$size)=>"ym7uBBuA" + (__yak_$size && __yak_$size === "big" ? " ym7uBBuB" : ""))(props.getSize())}>bound: read at two sites</li>
    { /* the attribute stays on the element AND feeds the condition, so binding
        it around the element is the only way to evaluate it once - otherwise
        the button could be disabled while it is styled as enabled */ }
    {((__yak_disabled)=><button disabled={__yak_disabled} className={"ym7uBBuT" + (!__yak_disabled ? " ym7uBBuU" : "")}>bound: element and condition</button>)(props.isBusy())}
    { /* one read, but inside a callback: the value would run once per list
        element */ }
    <div className={((__yak_$n)=>"ym7uBBuC" + (sizes.some((x)=>x > __yak_$n) ? " ym7uBBuD" : ""))(props.roll())}>bound: read inside a callback</div>
    { /* one read, but behind a short circuit: the value would not run at all */ }
    <div className={((__yak_$b)=>"ym7uBBuE" + (isCompact && __yak_$b ? " ym7uBBuF" : ""))(props.roll())}>bound: read behind a short circuit</div>
    { /* the allowlist is not "does it contain a call" - none of these is one */ }
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(i1++)}>bound: update expression</div>
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(new Date())}>bound: new expression</div>
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(props.getSize() as number)}>bound: judged under the type cast</div>
    { /* effect free but identity bearing - two reads would be two elements */ }
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(<i/>)}>bound: jsx element</div>
    { /* an impure builtin is bound like any other call, and stays in argument
        position: React's own purity rule flags it here exactly as it flags it
        in the source */ }
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(Math.random())}>bound: impure builtin</div>
    { /* inlined: a computed member over pure operands, and a comparison - the
        most common dynamic prop shapes there are */ }
    <div className={"ym7uBBuJ" + (colors[size!] ? " ym7uBBuK" : "")}>inlined: computed member</div>
    <div className={"ym7uBBuJ" + (i1 % 4 !== 0 ? " ym7uBBuK" : "")}>inlined: comparison</div>
    { /* the conditions read $a first; the arguments follow the attributes */ }
    <div className={((__yak_$b, __yak_$a)=>"ym7uBBuG" + (__yak_$a ? " ym7uBBuH" : "") + (__yak_$b ? " ym7uBBuI" : ""))(props.roll(), props.getSize())}>bound: arguments in attribute order</div>
    { /* attribute position ran getSize() twice, so binding does too */ }
    <div className={((__yak_$b, __yak_$a)=>"ym7uBBuG" + (__yak_$a ? " ym7uBBuH" : "") + (__yak_$b ? " ym7uBBuI" : ""))(props.getSize(), props.getSize())}>bound: never deduplicated</div>
    { /* read by no condition: it never leaves attribute position */ }
    <div id={props.getSize()} className={"ym7uBBuJ" + (active ? " ym7uBBuK" : "")}>inlined: unread attribute stays put</div>
    { /* an arrow may move, so an event handler never forces the element-wrap */ }
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(props.roll())} onClick={()=>props.track()}>bound: handler may move</div>
    { /* the user className composes around the block, after it - which is where
        it already ran */ }
    <div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(props.roll()) + " user"}>bound: static className merge</div>
    <div className={__yak_mergeClassNames(((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(props.roll()), size)}>bound: runtime className merge</div>
    <button className={"ym7uBBul" + (!(i1 % 4 !== 0) ? " ym7uBBum" : "") + ("primary" === "secondary" ? " ym7uBBun" : "") + ("primary" === "ghost" ? " ym7uBBuo" : "") + (i1 % 3 === 0 ? " ym7uBBup" : "")}>
      {i1}
    </button>
    <li key={i1} className={"ym7uBBuy" + (active ? " ym7uBBuz" : "")}>
      key at the call site still folds
    </li>
    <aside className={"ym7uBBuL" + (active ? " ym7uBBuM" : "")}>block body arrow</aside>
    { /* getSize() ran between the two rolls, and may not jump the parameter
        block, so the whole element is wrapped and captures all three in
        source order */ }
    {((__yak_$a, __yak_id, __yak_$b)=><div id={__yak_id} className={"ym7uBBuG" + (__yak_$a ? " ym7uBBuH" : "") + (__yak_$b ? " ym7uBBuI" : "")}>
      wrapped: nothing may jump the block
    </div>)(props.roll(), props.getSize(), props.roll())}
    { /* the user className ran BEFORE the roll, and it composes around the
        block, which would run it after - so this escalates too */ }
    {((__yak_className, __yak_$v)=><div className={__yak_mergeClassNames("ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""), __yak_className)}>wrapped: className ran first</div>)(props.getSize(), props.roll())}
    { /* an unread $prop is dropped before the DOM, so its value never runs at
        all - a side effect nobody consumes, which React's purity rule already
        forbids */ }
    <div className={"ym7uBBuJ" + (active ? " ym7uBBuK" : "")}>elided: unread $prop</div>
    { /* key and children stay normal JSX on the wrapped element */ }
    {sizes.map((it)=>((__yak_disabled)=><button key={it} disabled={__yak_disabled} className={"ym7uBBuT" + (!__yak_disabled ? " ym7uBBuU" : "")}>
        wrapped in a list
      </button>)(props.isBusy()))}
  </>;
// folds: await is legal in an async server component and impure, so it is
// bound - which only works because the value never moves out of argument
// position: awaiting inside the synthesized closure would not even parse
const AsyncPage = async ()=><div className={((__yak_$v)=>"ym7uBBuJ" + (__yak_$v ? " ym7uBBuK" : ""))(await props.load())}>bound: await stays an argument</div>;
const NotOptimizable = ()=><>
    <IconContainer {...props}>bails: spread</IconContainer>
    <Themed $accent>bails: theme access</Themed>
    <NestedCssVariable $active $size={12}>bails: nested css variable</NestedCssVariable>
    <DynamicExtended $active>bails: dynamic wrapped component</DynamicExtended>
    <DynamicAttrs $active>bails: dynamic attrs</DynamicAttrs>
    <ClassNameBail className="user">bails: className access</ClassNameBail>
    <MemberEscape $active>bails: whole props object escapes</MemberEscape>
    <MemberTheme $accent>bails: theme access</MemberTheme>
    <MemberComputed $active>bails: computed member access</MemberComputed>
    <KeyBail key="active">bails: destructured key access</KeyBail>
    <MemberKey key="active">bails: key access</MemberKey>
    <Renamed $size="big">bails: renamed destructuring</Renamed>
    <Defaulted>bails: default value destructuring</Defaulted>
    <Rested $size="big">bails: rest element destructuring</Rested>
    { /* spriteFor() would jump both rolls: the namespaced name is the only
        difference from the wrapped `id={...}` case above */ }
    <Sprite $active={props.roll()} xlink:href={props.getSize()} $muted={props.roll()}>
      bails: namespaced attribute
    </Sprite>
    { /* only the last of a repeated attribute is bound, so the first getSize()
        would be left on the element or dropped with the $prop */ }
    <ActionButton disabled={props.isBusy()} disabled={props.roll()}>
      bails: repeated attribute
    </ActionButton>
  </>;
