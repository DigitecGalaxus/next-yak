import { css, styled, __yak_unitPostFix, __yak_mergeClassNames } from "next-yak/internal";
import { ImportedCard } from "./imported-card";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0ljb25Db250YWluZXJfbTd1QkJ1IHsKICBkaXNwbGF5OiBmbGV4OwogIG1pbi1oZWlnaHQ6IDI0cHg7Cn0KLmlucHV0X0ljb25Db250YWluZXJfX1wkaGFzQ2hpbGRyZW5fbTd1QkJ1IHsKICBtYXJnaW4tcmlnaHQ6IDEycHg7Cn0uaW5wdXRfTWFueV9tN3VCQnUgewogIGNvbG9yOiBibGFjazsKfQouaW5wdXRfTWFueV9fX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfQouaW5wdXRfTWFueV9fX203dUJCdS0wMSB7CiAgY29sb3I6IGJsdWU7Cn0KLmlucHV0X01hbnlfX1wkYm9sZF9tN3VCQnUgewogIGZvbnQtd2VpZ2h0OiBib2xkOwp9LmlucHV0X0ZuX203dUJCdSB7CiAgY29sb3I6IGdyYXk7Cn0KLmlucHV0X0ZuX19cJG9uX203dUJCdSB7CiAgY29sb3I6IGJsYWNrOwp9LmlucHV0X1Njb3BlZF9tN3VCQnUgewogIGNvbG9yOiBncmVlbjsKfQouaW5wdXRfU2NvcGVkX19pc0NvbXBhY3RfbTd1QkJ1IHsKICBsaW5lLWhlaWdodDogMTsKfS5pbnB1dF9Ud2ljZV9tN3VCQnUgewogIHBhZGRpbmc6IDFweDsKfQouaW5wdXRfVHdpY2VfX19tN3VCQnUgewogIHBhZGRpbmc6IDhweDsKfS5pbnB1dF9BY3Rpb25CdXR0b25fbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfQouaW5wdXRfQWN0aW9uQnV0dG9uX19fbTd1QkJ1IHsKICBjdXJzb3I6IHBvaW50ZXI7Cn0uaW5wdXRfVGhlbWVkX203dUJCdSB7CiAgY29sb3I6IGJsYWNrOwp9Ci5pbnB1dF9UaGVtZWRfX19tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0uaW5wdXRfTmVzdGVkQ3NzVmFyaWFibGVfX1wkYWN0aXZlX203dUJCdSB7CiAgd2lkdGg6IHZhcigtLWlucHV0X05lc3RlZENzc1ZhcmlhYmxlX193aWR0aF9tN3VCQnUpOwp9LmlucHV0X0R5bmFtaWNFeHRlbmRlZF9fXCRhY3RpdmVfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X0R5bmFtaWNBdHRyc19fXCRhY3RpdmVfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X0NsYXNzTmFtZUJhaWxfX2NsYXNzTmFtZV9tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0uaW5wdXRfS2V5QmFpbF9fX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfS5pbnB1dF9NZW1iZXJCdXR0b25fbTd1QkJ1IHsKICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKfQouaW5wdXRfTWVtYmVyQnV0dG9uX19fbTd1QkJ1IHsKICBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFkNWRiOwp9Ci5pbnB1dF9NZW1iZXJCdXR0b25fX19tN3VCQnUtMDEgewogIGJhY2tncm91bmQtY29sb3I6ICNmM2Y0ZjY7Cn0KLmlucHV0X01lbWJlckJ1dHRvbl9fX203dUJCdS0wMiB7CiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0KLmlucHV0X01lbWJlckJ1dHRvbl9fcF9cJGZ1bGxXaWR0aF9tN3VCQnUgewogIHdpZHRoOiAxMDAlOwp9LmlucHV0X01lbWJlckVzY2FwZV9fX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfS5pbnB1dF9NZW1iZXJUaGVtZV9fX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfS5pbnB1dF9NZW1iZXJDb21wdXRlZF9fX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfS5pbnB1dF9NZW1iZXJLZXlfX19tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0uaW5wdXRfS2V5ZWRSb3dfX3BfXCRhY3RpdmVfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X09wdGltaXphYmxlX203dUJCdSB7CiAgY29sb3I6IG9yYW5nZTsKfQ==";
const props = {} as any;
// folds: the class-toggling expression is inlined at the usage
const IconContainer = /*YAK Extracted CSS:
.input_IconContainer_m7uBBu {
  display: flex;
  min-height: 24px;
}
.input_IconContainer__\$hasChildren_m7uBBu {
  margin-right: 12px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_IconContainer_m7uBBu", ({ $hasChildren })=>$hasChildren && /*#__PURE__*/ css("input_IconContainer__$hasChildren_m7uBBu")), {
    "displayName": "IconContainer"
});
// folds: ternary mixin plus a second expression
const Many = /*YAK Extracted CSS:
.input_Many_m7uBBu {
  color: black;
}
.input_Many___m7uBBu {
  color: red;
}
.input_Many___m7uBBu-01 {
  color: blue;
}
.input_Many__\$bold_m7uBBu {
  font-weight: bold;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Many_m7uBBu", ({ $variant })=>$variant === "primary" ? /*#__PURE__*/ css("input_Many___m7uBBu") : /*#__PURE__*/ css("input_Many___m7uBBu-01"), ({ $bold })=>$bold && /*#__PURE__*/ css("input_Many__$bold_m7uBBu")), {
    "displayName": "Many"
});
// folds: function expression form with a block body
const Fn = /*YAK Extracted CSS:
.input_Fn_m7uBBu {
  color: gray;
}
.input_Fn__\$on_m7uBBu {
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
.input_Scoped_m7uBBu {
  color: green;
}
.input_Scoped__isCompact_m7uBBu {
  line-height: 1;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_em("input_Scoped_m7uBBu", ()=>isCompact && /*#__PURE__*/ css("input_Scoped__isCompact_m7uBBu")), {
    "displayName": "Scoped"
});
// the twice-referenced $size attribute is inlined into both conditions
const Twice = /*YAK Extracted CSS:
.input_Twice_m7uBBu {
  padding: 1px;
}
.input_Twice___m7uBBu {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_Twice_m7uBBu", ({ $size })=>$size && $size === "big" && /*#__PURE__*/ css("input_Twice___m7uBBu")), {
    "displayName": "Twice"
});
// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = /*YAK Extracted CSS:
.input_ActionButton_m7uBBu {
  color: blue;
}
.input_ActionButton___m7uBBu {
  cursor: pointer;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ActionButton_m7uBBu", ({ disabled })=>!disabled && /*#__PURE__*/ css("input_ActionButton___m7uBBu")), {
    "displayName": "ActionButton"
});
// usages bail: the runtime injects the theme which is unknown at build time
const Themed = /*YAK Extracted CSS:
.input_Themed_m7uBBu {
  color: black;
}
.input_Themed___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_strong("input_Themed_m7uBBu", ({ theme, $accent })=>theme.highContrast && $accent && /*#__PURE__*/ css("input_Themed___m7uBBu")), {
    "displayName": "Themed"
});
// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = /*YAK Extracted CSS:
.input_NestedCssVariable__\$active_m7uBBu {
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
.input_DynamicExtended__\$active_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(ImportedCard)("input_DynamicExtended_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_DynamicExtended__$active_m7uBBu")), {
    "displayName": "DynamicExtended"
});
// usages bail: attrs
const DynamicAttrs = /*YAK Extracted CSS:
.input_DynamicAttrs__\$active_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("input_DynamicAttrs_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_DynamicAttrs__$active_m7uBBu")), {
    "displayName": "DynamicAttrs"
});
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
.input_ClassNameBail__className_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ClassNameBail_m7uBBu", ({ className })=>className && /*#__PURE__*/ css("input_ClassNameBail__className_m7uBBu")), {
    "displayName": "ClassNameBail"
});
// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = /*YAK Extracted CSS:
.input_KeyBail___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_KeyBail_m7uBBu", ({ key })=>key === "active" && /*#__PURE__*/ css("input_KeyBail___m7uBBu")), {
    "displayName": "KeyBail"
});
// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = /*YAK Extracted CSS:
.input_MemberButton_m7uBBu {
  display: inline-flex;
}
.input_MemberButton___m7uBBu {
  background-color: #d1d5db;
}
.input_MemberButton___m7uBBu-01 {
  background-color: #f3f4f6;
}
.input_MemberButton___m7uBBu-02 {
  background-color: transparent;
}
.input_MemberButton__p_\$fullWidth_m7uBBu {
  width: 100%;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_MemberButton_m7uBBu", (p)=>!p.$active && /*#__PURE__*/ css("input_MemberButton___m7uBBu"), (p)=>p.$variant === "secondary" && /*#__PURE__*/ css("input_MemberButton___m7uBBu-01"), (p)=>p.$variant === "ghost" && /*#__PURE__*/ css("input_MemberButton___m7uBBu-02"), (p)=>p.$fullWidth && /*#__PURE__*/ css("input_MemberButton__p_$fullWidth_m7uBBu")), {
    "displayName": "MemberButton"
});
// usages bail: the whole props object escapes into the function call
const MemberEscape = /*YAK Extracted CSS:
.input_MemberEscape___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberEscape_m7uBBu", (p)=>props.calculate(p) && /*#__PURE__*/ css("input_MemberEscape___m7uBBu")), {
    "displayName": "MemberEscape"
});
// usages bail: theme access through the identifier param
const MemberTheme = /*YAK Extracted CSS:
.input_MemberTheme___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberTheme_m7uBBu", (p)=>p.theme.highContrast && p.$accent && /*#__PURE__*/ css("input_MemberTheme___m7uBBu")), {
    "displayName": "MemberTheme"
});
// usages bail: computed member access
const MemberComputed = /*YAK Extracted CSS:
.input_MemberComputed___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberComputed_m7uBBu", (p)=>p["$active"] && /*#__PURE__*/ css("input_MemberComputed___m7uBBu")), {
    "displayName": "MemberComputed"
});
// usages bail: key access through the identifier param
const MemberKey = /*YAK Extracted CSS:
.input_MemberKey___m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_MemberKey_m7uBBu", (p)=>p.key === "active" && /*#__PURE__*/ css("input_MemberKey___m7uBBu")), {
    "displayName": "MemberKey"
});
// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = /*YAK Extracted CSS:
.input_KeyedRow__p_\$active_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_KeyedRow_m7uBBu", (p)=>p.$active && /*#__PURE__*/ css("input_KeyedRow__p_$active_m7uBBu")), {
    "displayName": "KeyedRow"
});
const Optimizable = ({ active, size, i: i1 }: {
    active?: boolean;
    size?: string;
    i: number;
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
.input_Optimizable_m7uBBu {
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
    { /* an impure value is inlined into every condition reading it, so the two
        rolls can disagree - the eslint rule precompute-style-prop-values asks
        the user to compute it once */ }
    <li className={"input_Twice_m7uBBu" + (props.getSize() && props.getSize() === "big" ? " input_Twice___m7uBBu" : "")}>evaluated once per condition</li>
    { /* the attribute stays on the element AND feeds the condition, so this
        button can be disabled while it is styled as enabled */ }
    <button disabled={props.isBusy()} className={"input_ActionButton_m7uBBu" + (!props.isBusy() ? " input_ActionButton___m7uBBu" : "")}>evaluated on the element and inlined</button>
    <button className={"input_MemberButton_m7uBBu" + (!(i1 % 4 !== 0) ? " input_MemberButton___m7uBBu" : "") + ("primary" === "secondary" ? " input_MemberButton___m7uBBu-01" : "") + ("primary" === "ghost" ? " input_MemberButton___m7uBBu-02" : "") + (i1 % 3 === 0 ? " input_MemberButton__p_$fullWidth_m7uBBu" : "")}>
      {i1}
    </button>
    <li key={i1} className={"input_KeyedRow_m7uBBu" + (active ? " input_KeyedRow__p_$active_m7uBBu" : "")}>
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
