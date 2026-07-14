import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const props = {} as any;
// folds: the class-toggling expression is inlined at the usage
const IconContainer = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  display: flex;
  min-height: 24px;
}
:global(.ym7uBBu1) {
  margin-right: 12px;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu", ({ $hasChildren })=>$hasChildren && /*#__PURE__*/ css("ym7uBBu1"));
// folds: ternary mixin plus a second expression
const Many = /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  color: black;
}
:global(.ym7uBBu3) {
  color: red;
}
:global(.ym7uBBu4) {
  color: blue;
}
:global(.ym7uBBu5) {
  font-weight: bold;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu2", ({ $variant })=>$variant === "primary" ? /*#__PURE__*/ css("ym7uBBu3") : /*#__PURE__*/ css("ym7uBBu4"), ({ $bold })=>$bold && /*#__PURE__*/ css("ym7uBBu5"));
// folds: function expression form with a block body
const Fn = /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: gray;
}
:global(.ym7uBBu7) {
  color: black;
}
*/ /*#__PURE__*/ __yak.__yak_i("ym7uBBu6", function({ $on }) {
    return $on && /*#__PURE__*/ css("ym7uBBu7");
});
// folds: zero-arg expressions reference the outer scope like the css prop
const isCompact = true;
const Scoped = /*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: green;
}
:global(.ym7uBBu9) {
  line-height: 1;
}
*/ /*#__PURE__*/ __yak.__yak_em("ym7uBBu8", ()=>isCompact && /*#__PURE__*/ css("ym7uBBu9"));
// the twice-referenced $size attribute is inlined into both conditions
const Twice = /*YAK Extracted CSS:
:global(.ym7uBBuA) {
  padding: 1px;
}
:global(.ym7uBBuB) {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuA", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("ym7uBBuB"));
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
:global(.ym7uBBuC) {
  color: blue;
}
:global(.ym7uBBuD) {
  cursor: pointer;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuC", ({ disabled })=>!disabled && /*#__PURE__*/ css("ym7uBBuD"));
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: black;
}
:global(.ym7uBBuF) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_strong("ym7uBBuE", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("ym7uBBuF"));
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
:global(.ym7uBBuH) {
  width: var(--ym7uBBuI);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuG", ({ $active, $size })=>$active && /*#__PURE__*/ css("ym7uBBuH", {
        "style": {
            "--ym7uBBuI": /*#__PURE__*/ __yak_unitPostFix(()=>$size, "px")
        }
    }));
// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = /*YAK Extracted CSS:
:global(.ym7uBBuK) {
  color: red;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBuJ", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuK"));
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
:global(.ym7uBBuM) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBuL", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuM"));
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
:global(.ym7uBBuO) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuN", ({ className })=>className && /*#__PURE__*/ css("ym7uBBuO"));
// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = /*YAK Extracted CSS:
:global(.ym7uBBuQ) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuP", ({ key })=>key === "active" && /*#__PURE__*/ css("ym7uBBuQ"));
// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = /*YAK Extracted CSS:
:global(.ym7uBBuR) {
  display: inline-flex;
}
:global(.ym7uBBuS) {
  background-color: #d1d5db;
}
:global(.ym7uBBuT) {
  background-color: #f3f4f6;
}
:global(.ym7uBBuU) {
  background-color: transparent;
}
:global(.ym7uBBuV) {
  width: 100%;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuR", (p)=>!p.$active && /*#__PURE__*/ css("ym7uBBuS"), (p)=>p.$variant === "secondary" && /*#__PURE__*/ css("ym7uBBuT"), (p)=>p.$variant === "ghost" && /*#__PURE__*/ css("ym7uBBuU"), (p)=>p.$fullWidth && /*#__PURE__*/ css("ym7uBBuV"));
// usages bail: the whole props object escapes into the function call
const MemberEscape = /*YAK Extracted CSS:
:global(.ym7uBBuX) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuW", (p)=>props.calculate(p) && /*#__PURE__*/ css("ym7uBBuX"));
// usages bail: theme access through the identifier param
const MemberTheme = /*YAK Extracted CSS:
:global(.ym7uBBuZ) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuY", (p)=>p.theme.highContrast && p.$accent && /*#__PURE__*/ css("ym7uBBuZ"));
// usages bail: computed member access
const MemberComputed = /*YAK Extracted CSS:
:global(.ym7uBBub) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBua", (p)=>p["$active"] && /*#__PURE__*/ css("ym7uBBub"));
// usages bail: key access through the identifier param
const MemberKey = /*YAK Extracted CSS:
:global(.ym7uBBud) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuc", (p)=>p.key === "active" && /*#__PURE__*/ css("ym7uBBud"));
// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = /*YAK Extracted CSS:
:global(.ym7uBBuf) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBue", (p)=>p.$active && /*#__PURE__*/ css("ym7uBBuf"));
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
:global(.ym7uBBug) {
  color: orange;
}
*/ /*#__PURE__*/ " ym7uBBug"}>
      css prop merge
    </span>
    <p className={"ym7uBBu2" + ("primary" === "primary" ? " ym7uBBu3" : " ym7uBBu4") + (true ? " ym7uBBu5" : "")}>
      two inlined expressions
    </p>
    <i className={"ym7uBBu6" + (active ? " ym7uBBu7" : "")}>function form</i>
    <em className={"ym7uBBu8" + (isCompact ? " ym7uBBu9" : "")}>outer scope condition</em>
    <li className={"ym7uBBuA" + (size && size === "big" ? " ym7uBBuB" : "")}>safe to duplicate</li>
    <button disabled={active} className={"ym7uBBuC" + (!active ? " ym7uBBuD" : "")}>kept on the element and inlined</button>
    <button disabled className={"ym7uBBuC" + (!true ? " ym7uBBuD" : "")}>bare non-$ prop</button>
    { /* an impure value is inlined into every condition reading it, so the two
        rolls can disagree - the eslint rule precompute-style-prop-values asks
        the user to compute it once */ }
    <li className={"ym7uBBuA" + (props.getSize() && props.getSize() === "big" ? " ym7uBBuB" : "")}>evaluated once per condition</li>
    { /* the attribute stays on the element AND feeds the condition, so this
        button can be disabled while it is styled as enabled */ }
    <button disabled={props.isBusy()} className={"ym7uBBuC" + (!props.isBusy() ? " ym7uBBuD" : "")}>evaluated on the element and inlined</button>
    <button className={"ym7uBBuR" + (!(i1 % 4 !== 0) ? " ym7uBBuS" : "") + ("primary" === "secondary" ? " ym7uBBuT" : "") + ("primary" === "ghost" ? " ym7uBBuU" : "") + (i1 % 3 === 0 ? " ym7uBBuV" : "")}>
      {i1}
    </button>
    <li key={i1} className={"ym7uBBue" + (active ? " ym7uBBuf" : "")}>
      key at the call site still folds
    </li>
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
  </>;
