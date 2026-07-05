import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const props = {} as any;
// folds: the class-toggling expression is inlined at the usage
const IconContainer = /*YAK Extracted CSS:
:global(.input_IconContainer_m7uBBu) {
  display: flex;
  min-height: 24px;
}
:global(.input_IconContainer__\$hasChildren_m7uBBu) {
  margin-right: 12px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_IconContainer_m7uBBu", ({ $hasChildren })=>$hasChildren && /*#__PURE__*/ css("input_IconContainer__$hasChildren_m7uBBu")), {
    "displayName": "IconContainer"
});
// folds: ternary mixin plus a second expression
const Many = /*YAK Extracted CSS:
:global(.input_Many_m7uBBu) {
  color: black;
}
:global(.input_Many___m7uBBu) {
  color: red;
}
:global(.input_Many___m7uBBu-01) {
  color: blue;
}
:global(.input_Many__\$bold_m7uBBu) {
  font-weight: bold;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Many_m7uBBu", ({ $variant })=>$variant === "primary" ? /*#__PURE__*/ css("input_Many___m7uBBu") : /*#__PURE__*/ css("input_Many___m7uBBu-01"), ({ $bold })=>$bold && /*#__PURE__*/ css("input_Many__$bold_m7uBBu")), {
    "displayName": "Many"
});
// folds: function expression form with a block body
const Fn = /*YAK Extracted CSS:
:global(.input_Fn_m7uBBu) {
  color: gray;
}
:global(.input_Fn__\$on_m7uBBu) {
  color: black;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_i("input_Fn_m7uBBu", function({ $on }) {
    return $on && /*#__PURE__*/ css("input_Fn__$on_m7uBBu");
}), {
    "displayName": "Fn"
});
// folds: zero-arg expressions reference the outer scope like the css prop
const isCompact = true;
const Scoped = /*YAK Extracted CSS:
:global(.input_Scoped_m7uBBu) {
  color: green;
}
:global(.input_Scoped__isCompact_m7uBBu) {
  line-height: 1;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_em("input_Scoped_m7uBBu", ()=>isCompact && /*#__PURE__*/ css("input_Scoped__isCompact_m7uBBu")), {
    "displayName": "Scoped"
});
// usages fold only when the twice-referenced $size attribute is safe to duplicate
const Twice = /*YAK Extracted CSS:
:global(.input_Twice_m7uBBu) {
  padding: 1px;
}
:global(.input_Twice___m7uBBu) {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_Twice_m7uBBu", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("input_Twice___m7uBBu")), {
    "displayName": "Twice"
});
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
:global(.input_ActionButton_m7uBBu) {
  color: blue;
}
:global(.input_ActionButton___m7uBBu) {
  cursor: pointer;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ActionButton_m7uBBu", ({ disabled })=>!disabled && /*#__PURE__*/ css("input_ActionButton___m7uBBu")), {
    "displayName": "ActionButton"
});
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
:global(.input_Themed_m7uBBu) {
  color: black;
}
:global(.input_Themed___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_strong("input_Themed_m7uBBu", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("input_Themed___m7uBBu")), {
    "displayName": "Themed"
});
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
:global(.input_NestedCssVariable__\$active_m7uBBu) {
  width: var(--input_NestedCssVariable__width_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_NestedCssVariable_m7uBBu", ({ $active, $size })=>$active && /*#__PURE__*/ css("input_NestedCssVariable__$active_m7uBBu", {
        "style": {
            "--input_NestedCssVariable__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(()=>$size, "px")
        }
    })), {
    "displayName": "NestedCssVariable"
});
// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = /*YAK Extracted CSS:
:global(.input_DynamicExtended__\$active_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(ImportedCard)("input_DynamicExtended_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_DynamicExtended__$active_m7uBBu")), {
    "displayName": "DynamicExtended"
});
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
:global(.input_DynamicAttrs__\$active_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("input_DynamicAttrs_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_DynamicAttrs__$active_m7uBBu")), {
    "displayName": "DynamicAttrs"
});
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
:global(.input_ClassNameBail__className_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ClassNameBail_m7uBBu", ({ className })=>className && /*#__PURE__*/ css("input_ClassNameBail__className_m7uBBu")), {
    "displayName": "ClassNameBail"
});
const Optimizable = ({ active, size }: {
    active?: boolean;
    size?: string;
})=><>
    <span aria-hidden className={"input_IconContainer_m7uBBu" + (true ? " input_IconContainer__$hasChildren_m7uBBu" : "")}>
      <i/>
    </span>
    <span data-kept="yes" className={"input_IconContainer_m7uBBu" + (active ? " input_IconContainer__$hasChildren_m7uBBu" : "")}>
      inlines the attribute expression and drops all $props
    </span>
    <span className={"input_IconContainer_m7uBBu" + (void 0 ? " input_IconContainer__$hasChildren_m7uBBu" : "")}>absent $props count as undefined</span>
    <span className={"input_IconContainer_m7uBBu" + (true ? " input_IconContainer__$hasChildren_m7uBBu" : "") + " user"}>
      static class merge
    </span>
    <span className={__yak_mergeClassNames("input_IconContainer_m7uBBu" + (true ? " input_IconContainer__$hasChildren_m7uBBu" : ""), active && "on")}>
      runtime class merge
    </span>
    <span className={"input_IconContainer_m7uBBu" + (true ? " input_IconContainer__$hasChildren_m7uBBu" : "") + /*YAK Extracted CSS:
:global(.input_Optimizable_m7uBBu) {
  color: orange;
}
*/ /*#__PURE__*/ " input_Optimizable_m7uBBu"}>
      css prop merge
    </span>
    <p className={"input_Many_m7uBBu" + ("primary" === "primary" ? " input_Many___m7uBBu" : " input_Many___m7uBBu-01") + (true ? " input_Many__$bold_m7uBBu" : "")}>
      two inlined expressions
    </p>
    <i className={"input_Fn_m7uBBu" + (active ? " input_Fn__$on_m7uBBu" : "")}>function form</i>
    <em className={"input_Scoped_m7uBBu" + (isCompact ? " input_Scoped__isCompact_m7uBBu" : "")}>outer scope condition</em>
    <li className={"input_Twice_m7uBBu" + (size && size === "big" ? " input_Twice___m7uBBu" : "")}>safe to duplicate</li>
    <button disabled={active} className={"input_ActionButton_m7uBBu" + (!active ? " input_ActionButton___m7uBBu" : "")}>kept on the element and inlined</button>
    <button disabled className={"input_ActionButton_m7uBBu" + (!true ? " input_ActionButton___m7uBBu" : "")}>bare non-$ prop</button>
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
