import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGRpc3BsYXk6IGZsZXg7CiAgbWluLWhlaWdodDogMjRweDsKfQoueW03dUJCdTEgewogIG1hcmdpbi1yaWdodDogMTJweDsKfS55bTd1QkJ1MiB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1MyB7CiAgY29sb3I6IHJlZDsKfQoueW03dUJCdTQgewogIGNvbG9yOiBibHVlOwp9Ci55bTd1QkJ1NSB7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0ueW03dUJCdTYgewogIGNvbG9yOiBncmF5Owp9Ci55bTd1QkJ1NyB7CiAgY29sb3I6IGJsYWNrOwp9LnltN3VCQnU4IHsKICBjb2xvcjogZ3JlZW47Cn0KLnltN3VCQnU5IHsKICBsaW5lLWhlaWdodDogMTsKfS55bTd1QkJ1QSB7CiAgcGFkZGluZzogMXB4Owp9Ci55bTd1QkJ1QiB7CiAgcGFkZGluZzogOHB4Owp9LnltN3VCQnVDIHsKICBjb2xvcjogYmx1ZTsKfQoueW03dUJCdUQgewogIGN1cnNvcjogcG9pbnRlcjsKfS55bTd1QkJ1RSB7CiAgY29sb3I6IGJsYWNrOwp9Ci55bTd1QkJ1RiB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1SCB7CiAgd2lkdGg6IHZhcigtLXltN3VCQnVJKTsKfS55bTd1QkJ1SyB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1TSB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1TyB7CiAgY29sb3I6IHJlZDsKfS55bTd1QkJ1UCB7CiAgY29sb3I6IG9yYW5nZTsKfQ==";
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
// usages fold only when the twice-referenced $size attribute is safe to duplicate
const Twice = /*YAK Extracted CSS:
.ym7uBBuA {
  padding: 1px;
}
.ym7uBBuB {
  padding: 8px;
}
*/ /*#__PURE__*/ __yak.__yak_li("ym7uBBuA", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("ym7uBBuB"));
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
.ym7uBBuC {
  color: blue;
}
.ym7uBBuD {
  cursor: pointer;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBuC", ({ disabled })=>!disabled && /*#__PURE__*/ css("ym7uBBuD"));
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
.ym7uBBuE {
  color: black;
}
.ym7uBBuF {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_strong("ym7uBBuE", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("ym7uBBuF"));
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
.ym7uBBuH {
  width: var(--ym7uBBuI);
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuG", ({ $active, $size })=>$active && /*#__PURE__*/ css("ym7uBBuH", {
        "style": {
            "--ym7uBBuI": /*#__PURE__*/ __yak_unitPostFix(()=>$size, "px")
        }
    }));
// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = /*YAK Extracted CSS:
.ym7uBBuK {
  color: red;
}
*/ /*#__PURE__*/ styled(ImportedCard)("ym7uBBuJ", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuK"));
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
.ym7uBBuM {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("ym7uBBuL", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBuM"));
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
.ym7uBBuO {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBuN", ({ className })=>className && /*#__PURE__*/ css("ym7uBBuO"));
const Optimizable = ({ active, size }: {
    active?: boolean;
    size?: string;
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
.ym7uBBuP {
  color: orange;
}
*/ /*#__PURE__*/ " ym7uBBuP"}>
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
  </>;
const NotOptimizable = ()=><>
    <IconContainer {...props}>bails: spread</IconContainer>
    <Twice $size={props.getSize()}>bails: unsafe to duplicate</Twice>
    <Themed $accent>bails: theme access</Themed>
    <NestedCssVariable $active $size={12}>bails: nested css variable</NestedCssVariable>
    <DynamicExtended $active>bails: dynamic wrapped component</DynamicExtended>
    <DynamicAttrs $active>bails: dynamic attrs</DynamicAttrs>
    <ClassNameBail className="user">bails: className access</ClassNameBail>
    <ActionButton disabled={props.isBusy()}>
      bails: the kept attribute would evaluate a second time in the className
    </ActionButton>
  </>;
