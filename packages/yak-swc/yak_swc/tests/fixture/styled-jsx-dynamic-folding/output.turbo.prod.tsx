import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGRpc3BsYXk6IGZsZXg7CiAgbWluLWhlaWdodDogMjRweDsKfQoueW03dUJCdTEgewogIG1hcmdpbi1yaWdodDogMTJweDsKfS55bTd1QkJ1MiB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1MyB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdTQgewogIGNvbG9yOiBibHVlOwp9Ci55bTd1QkJ1NSB7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0ueW03dUJCdTYgewogIGNvbG9yOiBncmF5Owp9Ci55bTd1QkJ1NyB7CiAgY29sb3I6IGJsYWNrOwp9LnltN3VCQnU4IHsKICBjb2xvcjogZ3JlZW47Cn0KLnltN3VCQnU5IHsKICBsaW5lLWhlaWdodDogMTsKfS55bTd1QkJ1QSB7CiAgcGFkZGluZzogMXB4Owp9Ci55bTd1QkJ1QiB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVDIHsKICBwYWRkaW5nOiAxcHg7Cn0KLnltN3VCQnVEIHsKICBwYWRkaW5nOiA4cHg7Cn0ueW03dUJCdUYgewogIHBhZGRpbmc6IDhweDsKfS55bTd1QkJ1SCB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVKIHsKICBwYWRkaW5nOiA4cHg7Cn0ueW03dUJCdUsgewogIGNvbG9yOiBibHVlOwp9Ci55bTd1QkJ1TCB7CiAgY3Vyc29yOiBwb2ludGVyOwp9LnltN3VCQnVNIHsKICBjb2xvcjogYmxhY2s7Cn0KLnltN3VCQnVOIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVQIHsKICB3aWR0aDogdmFyKC0teW03dUJCdVEpOwp9LnltN3VCQnVTIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVVIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVXIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVZIHsKICBjb2xvcjogcmVkOwp9LnltN3VCQnVaIHsKICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKfQoueW03dUJCdWEgewogIGJhY2tncm91bmQtY29sb3I6ICNkMWQ1ZGI7Cn0KLnltN3VCQnViIHsKICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNGY2Owp9Ci55bTd1QkJ1YyB7CiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0KLnltN3VCQnVkIHsKICB3aWR0aDogMTAwJTsKfS55bTd1QkJ1ZiB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1aCB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1aiB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1bCB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1biB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1byB7CiAgY29sb3I6IG9yYW5nZTsKfQ==";
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
// folds: function expression form with a block body
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
// the twice-referenced $size attribute is inlined into both conditions
const Twice = /*YAK Extracted CSS:
.ym7uBBuA {
  padding: 1px;
}
.ym7uBBuB {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuA", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("ym7uBBuB"));
// folds: an arrow returning from a block body is a condition like any other
const BlockBody = /*YAK Extracted CSS:
.ym7uBBuC {
  padding: 1px;
}
.ym7uBBuD {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_aside("ym7uBBuC", ({ $wide })=>{
    return $wide && /*#__PURE__*/ css("ym7uBBuD");
});
// usages bail: only plain destructuring substitutes - a rename, a default or a
// rest element all keep the runtime path
// (the precompute-style-prop-values eslint rule skips these shapes for the
// same reason, so this pins the contract it relies on)
const Renamed = /*YAK Extracted CSS:
.ym7uBBuF {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuE", ({ $size: size })=>size && size === "big" && /*#__PURE__*/ css("ym7uBBuF"));
const Defaulted = /*YAK Extracted CSS:
.ym7uBBuH {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuG", ({ $size = "big" })=>$size === "big" && /*#__PURE__*/ css("ym7uBBuH"));
const Rested = /*YAK Extracted CSS:
.ym7uBBuJ {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_mark("ym7uBBuI", ({ $size, ...rest })=>$size && rest && /*#__PURE__*/ css("ym7uBBuJ"));
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
.ym7uBBuK {
  color: blue;
}
.ym7uBBuL {
  cursor: pointer;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuK", ({ disabled })=>!disabled && /*#__PURE__*/ css("ym7uBBuL"));
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
.ym7uBBuM {
  color: black;
}
.ym7uBBuN {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_strong("ym7uBBuM", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("ym7uBBuN"));
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
.ym7uBBuP {
  width: var(--ym7uBBuQ);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuO", ({ $active, $size })=>$active && /*#__PURE__*/ css("ym7uBBuP", {
        "style": {
            "--ym7uBBuQ": /*#__PURE__*/ __yak_unitPostFix(()=>$size, "px")
        }
    }));
// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = /*YAK Extracted CSS:
.ym7uBBuS {
  color: red;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBuR", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuS"));
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
.ym7uBBuU {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBuT", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuU"));
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
.ym7uBBuW {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuV", ({ className })=>className && /*#__PURE__*/ css("ym7uBBuW"));
// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = /*YAK Extracted CSS:
.ym7uBBuY {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuX", ({ key })=>key === "active" && /*#__PURE__*/ css("ym7uBBuY"));
// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = /*YAK Extracted CSS:
.ym7uBBuZ {
  display: inline-flex;
}
.ym7uBBua {
  background-color: #d1d5db;
}
.ym7uBBub {
  background-color: #f3f4f6;
}
.ym7uBBuc {
  background-color: transparent;
}
.ym7uBBud {
  width: 100%;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuZ", (p)=>!p.$active && /*#__PURE__*/ css("ym7uBBua"), (p)=>p.$variant === "secondary" && /*#__PURE__*/ css("ym7uBBub"), (p)=>p.$variant === "ghost" && /*#__PURE__*/ css("ym7uBBuc"), (p)=>p.$fullWidth && /*#__PURE__*/ css("ym7uBBud"));
// usages bail: the whole props object escapes into the function call
const MemberEscape = /*YAK Extracted CSS:
.ym7uBBuf {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBue", (p)=>props.calculate(p) && /*#__PURE__*/ css("ym7uBBuf"));
// usages bail: theme access through the identifier param
const MemberTheme = /*YAK Extracted CSS:
.ym7uBBuh {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBug", (p)=>p.theme.highContrast && p.$accent && /*#__PURE__*/ css("ym7uBBuh"));
// usages bail: computed member access
const MemberComputed = /*YAK Extracted CSS:
.ym7uBBuj {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBui", (p)=>p["$active"] && /*#__PURE__*/ css("ym7uBBuj"));
// usages bail: key access through the identifier param
const MemberKey = /*YAK Extracted CSS:
.ym7uBBul {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuk", (p)=>p.key === "active" && /*#__PURE__*/ css("ym7uBBul"));
// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = /*YAK Extracted CSS:
.ym7uBBun {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBum", (p)=>p.$active && /*#__PURE__*/ css("ym7uBBun"));
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
.ym7uBBuo {
  color: orange;
}
*/ /*#__PURE__*/ " ym7uBBuo"}>
      css prop merge
    </span>
    <p className={"ym7uBBu2" + ("primary" === "primary" ? " ym7uBBu3" : " ym7uBBu4") + (true ? " ym7uBBu5" : "")}>
      two inlined expressions
    </p>
    <i className={"ym7uBBu6" + (active ? " ym7uBBu7" : "")}>function form</i>
    <em className={"ym7uBBu8" + (isCompact ? " ym7uBBu9" : "")}>outer scope condition</em>
    <li className={"ym7uBBuA" + (size && size === "big" ? " ym7uBBuB" : "")}>safe to duplicate</li>
    <button disabled={active} className={"ym7uBBuK" + (!active ? " ym7uBBuL" : "")}>kept on the element and inlined</button>
    <button disabled className={"ym7uBBuK" + (!true ? " ym7uBBuL" : "")}>bare non-$ prop</button>
    { /* an impure value is inlined into every condition reading it, so the two
        rolls can disagree - the eslint rule precompute-style-prop-values asks
        the user to compute it once */ }
    <li className={"ym7uBBuA" + (props.getSize() && props.getSize() === "big" ? " ym7uBBuB" : "")}>evaluated once per condition</li>
    { /* the attribute stays on the element AND feeds the condition, so this
        button can be disabled while it is styled as enabled */ }
    <button disabled={props.isBusy()} className={"ym7uBBuK" + (!props.isBusy() ? " ym7uBBuL" : "")}>evaluated on the element and inlined</button>
    <button className={"ym7uBBuZ" + (!(i1 % 4 !== 0) ? " ym7uBBua" : "") + ("primary" === "secondary" ? " ym7uBBub" : "") + ("primary" === "ghost" ? " ym7uBBuc" : "") + (i1 % 3 === 0 ? " ym7uBBud" : "")}>
      {i1}
    </button>
    <li key={i1} className={"ym7uBBum" + (active ? " ym7uBBun" : "")}>
      key at the call site still folds
    </li>
    <aside className={"ym7uBBuC" + (active ? " ym7uBBuD" : "")}>block body arrow</aside>
  </>;
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
  </>;
