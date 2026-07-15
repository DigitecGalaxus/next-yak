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
// the twice-referenced $size attribute is read at two sites, so an impure
// value would be evaluated twice - it is bound once instead
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
// folds: one read, inside a callback - an impure value would run once per list
// element, so a single read is enough to bind it
const sizes = [
    1,
    2,
    3
];
const InCallback = /*YAK Extracted CSS:
:global(.input_InCallback___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_InCallback_m7uBBu", ({ $n })=>sizes.some((x)=>x > $n) && /*#__PURE__*/ css("input_InCallback___m7uBBu")), {
    "displayName": "InCallback"
});
// folds: one read, behind a short circuit - an impure value would not run at
// all when the left side is falsy
const ShortCircuit = /*YAK Extracted CSS:
:global(.input_ShortCircuit___m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ShortCircuit_m7uBBu", ({ $b })=>isCompact && $b && /*#__PURE__*/ css("input_ShortCircuit___m7uBBu")), {
    "displayName": "ShortCircuit"
});
// folds: the conditions read $a before $b, the attributes pass $b first - the
// arguments follow the attributes, not the conditions
const Pair = /*YAK Extracted CSS:
:global(.input_Pair__\$a_m7uBBu) {
  color: red;
}
:global(.input_Pair__\$b_m7uBBu) {
  top: 0;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Pair_m7uBBu", ({ $a })=>$a && /*#__PURE__*/ css("input_Pair__$a_m7uBBu"), ({ $b })=>$b && /*#__PURE__*/ css("input_Pair__$b_m7uBBu")), {
    "displayName": "Pair"
});
// folds: a single condition to pin what counts as safe to inline
const colors = {
    big: "red"
} as Record<string, string>;
const Boxed = /*YAK Extracted CSS:
:global(.input_Boxed__\$v_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Boxed_m7uBBu", ({ $v })=>$v && /*#__PURE__*/ css("input_Boxed__$v_m7uBBu")), {
    "displayName": "Boxed"
});
// folds: an arrow returning from a block body is a condition like any other
const BlockBody = /*YAK Extracted CSS:
:global(.input_BlockBody_m7uBBu) {
  padding: 1px;
}
:global(.input_BlockBody__\$wide_m7uBBu) {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_aside("input_BlockBody_m7uBBu", ({ $wide })=>{
    return $wide && /*#__PURE__*/ css("input_BlockBody__$wide_m7uBBu");
}), {
    "displayName": "BlockBody"
});
// usages bail: only plain destructuring substitutes - a rename, a default or a
// rest element all keep the runtime path
const Renamed = /*YAK Extracted CSS:
:global(.input_Renamed___m7uBBu) {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_mark("input_Renamed_m7uBBu", ({ $size: size })=>size && size === "big" && /*#__PURE__*/ css("input_Renamed___m7uBBu")), {
    "displayName": "Renamed"
});
const Defaulted = /*YAK Extracted CSS:
:global(.input_Defaulted___m7uBBu) {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_mark("input_Defaulted_m7uBBu", ({ $size = "big" })=>$size === "big" && /*#__PURE__*/ css("input_Defaulted___m7uBBu")), {
    "displayName": "Defaulted"
});
const Rested = /*YAK Extracted CSS:
:global(.input_Rested___m7uBBu) {
  padding: 8px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_mark("input_Rested_m7uBBu", ({ $size, ...rest })=>$size && rest && /*#__PURE__*/ css("input_Rested___m7uBBu")), {
    "displayName": "Rested"
});
// usages bail: a function expression binds this/arguments, which inlining
// would rebind to the enclosing component
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
// usages bail: a namespaced attribute is keyed by its plain name everywhere
// below, so it would evaluate on the element without ever counting as an
// obstacle the parameter block may not jump - `<use xlink:href>` is the
// sprite pattern, and svg/use/image are all foldable elements
const Sprite = /*YAK Extracted CSS:
:global(.input_Sprite__\$active_m7uBBu) {
  color: red;
}
:global(.input_Sprite__\$muted_m7uBBu) {
  opacity: 0.5;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_use("input_Sprite_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_Sprite__$active_m7uBBu"), ({ $muted })=>$muted && /*#__PURE__*/ css("input_Sprite__$muted_m7uBBu")), {
    "displayName": "Sprite"
});
// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = /*YAK Extracted CSS:
:global(.input_ClassNameBail__className_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_ClassNameBail_m7uBBu", ({ className })=>className && /*#__PURE__*/ css("input_ClassNameBail__className_m7uBBu")), {
    "displayName": "ClassNameBail"
});
// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = /*YAK Extracted CSS:
:global(.input_KeyBail___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_KeyBail_m7uBBu", ({ key })=>key === "active" && /*#__PURE__*/ css("input_KeyBail___m7uBBu")), {
    "displayName": "KeyBail"
});
// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = /*YAK Extracted CSS:
:global(.input_MemberButton_m7uBBu) {
  display: inline-flex;
}
:global(.input_MemberButton___m7uBBu) {
  background-color: #d1d5db;
}
:global(.input_MemberButton___m7uBBu-01) {
  background-color: #f3f4f6;
}
:global(.input_MemberButton___m7uBBu-02) {
  background-color: transparent;
}
:global(.input_MemberButton__p_\$fullWidth_m7uBBu) {
  width: 100%;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_MemberButton_m7uBBu", (p)=>!p.$active && /*#__PURE__*/ css("input_MemberButton___m7uBBu"), (p)=>p.$variant === "secondary" && /*#__PURE__*/ css("input_MemberButton___m7uBBu-01"), (p)=>p.$variant === "ghost" && /*#__PURE__*/ css("input_MemberButton___m7uBBu-02"), (p)=>p.$fullWidth && /*#__PURE__*/ css("input_MemberButton__p_$fullWidth_m7uBBu")), {
    "displayName": "MemberButton"
});
// usages bail: the whole props object escapes into the function call
const MemberEscape = /*YAK Extracted CSS:
:global(.input_MemberEscape___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberEscape_m7uBBu", (p)=>props.calculate(p) && /*#__PURE__*/ css("input_MemberEscape___m7uBBu")), {
    "displayName": "MemberEscape"
});
// usages bail: theme access through the identifier param
const MemberTheme = /*YAK Extracted CSS:
:global(.input_MemberTheme___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberTheme_m7uBBu", (p)=>p.theme.highContrast && p.$accent && /*#__PURE__*/ css("input_MemberTheme___m7uBBu")), {
    "displayName": "MemberTheme"
});
// usages bail: computed member access
const MemberComputed = /*YAK Extracted CSS:
:global(.input_MemberComputed___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_MemberComputed_m7uBBu", (p)=>p["$active"] && /*#__PURE__*/ css("input_MemberComputed___m7uBBu")), {
    "displayName": "MemberComputed"
});
// usages bail: key access through the identifier param
const MemberKey = /*YAK Extracted CSS:
:global(.input_MemberKey___m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li("input_MemberKey_m7uBBu", (p)=>p.key === "active" && /*#__PURE__*/ css("input_MemberKey___m7uBBu")), {
    "displayName": "MemberKey"
});
// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = /*YAK Extracted CSS:
:global(.input_KeyedRow__p_\$active_m7uBBu) {
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
:global(.input_Optimizable_m7uBBu) {
  color: orange;
}
*/ /*#__PURE__*/ " input_Optimizable_m7uBBu"}>
      css prop merge
    </span>
    <p className={"input_Many_m7uBBu" + ("primary" === "primary" ? " input_Many___m7uBBu" : " input_Many___m7uBBu-01") + (true ? " input_Many__$bold_m7uBBu" : "")}>
      two inlined expressions
    </p>
    <em className={"input_Scoped_m7uBBu" + (isCompact ? " input_Scoped__isCompact_m7uBBu" : "")}>outer scope condition</em>
    <li className={"input_Twice_m7uBBu" + (size && size === "big" ? " input_Twice___m7uBBu" : "")}>safe to duplicate</li>
    <button disabled={active} className={"input_ActionButton_m7uBBu" + (!active ? " input_ActionButton___m7uBBu" : "")}>kept on the element and inlined</button>
    <button disabled className={"input_ActionButton_m7uBBu" + (!true ? " input_ActionButton___m7uBBu" : "")}>bare non-$ prop</button>
    { /* two read sites, so the value is bound once instead of rolled twice -
        the two conditions could otherwise disagree */ }
    <li className={((__yak_$size)=>"input_Twice_m7uBBu" + (__yak_$size && __yak_$size === "big" ? " input_Twice___m7uBBu" : ""))(props.getSize())}>bound: read at two sites</li>
    { /* the attribute stays on the element AND feeds the condition, so binding
        it around the element is the only way to evaluate it once - otherwise
        the button could be disabled while it is styled as enabled */ }
    {((__yak_disabled)=><button disabled={__yak_disabled} className={"input_ActionButton_m7uBBu" + (!__yak_disabled ? " input_ActionButton___m7uBBu" : "")}>bound: element and condition</button>)(props.isBusy())}
    { /* one read, but inside a callback: the value would run once per list
        element */ }
    <div className={((__yak_$n)=>"input_InCallback_m7uBBu" + (sizes.some((x)=>x > __yak_$n) ? " input_InCallback___m7uBBu" : ""))(props.roll())}>bound: read inside a callback</div>
    { /* one read, but behind a short circuit: the value would not run at all */ }
    <div className={((__yak_$b)=>"input_ShortCircuit_m7uBBu" + (isCompact && __yak_$b ? " input_ShortCircuit___m7uBBu" : ""))(props.roll())}>bound: read behind a short circuit</div>
    { /* the allowlist is not "does it contain a call" - none of these is one */ }
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(i1++)}>bound: update expression</div>
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(new Date())}>bound: new expression</div>
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(props.getSize() as number)}>bound: judged under the type cast</div>
    { /* effect free but identity bearing - two reads would be two elements */ }
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(<i/>)}>bound: jsx element</div>
    { /* an impure builtin is bound like any other call, and stays in argument
        position: React's own purity rule flags it here exactly as it flags it
        in the source */ }
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(Math.random())}>bound: impure builtin</div>
    { /* inlined: a computed member over pure operands, and a comparison - the
        most common dynamic prop shapes there are */ }
    <div className={"input_Boxed_m7uBBu" + (colors[size!] ? " input_Boxed__$v_m7uBBu" : "")}>inlined: computed member</div>
    <div className={"input_Boxed_m7uBBu" + (i1 % 4 !== 0 ? " input_Boxed__$v_m7uBBu" : "")}>inlined: comparison</div>
    { /* the conditions read $a first; the arguments follow the attributes */ }
    <div className={((__yak_$b, __yak_$a)=>"input_Pair_m7uBBu" + (__yak_$a ? " input_Pair__$a_m7uBBu" : "") + (__yak_$b ? " input_Pair__$b_m7uBBu" : ""))(props.roll(), props.getSize())}>bound: arguments in attribute order</div>
    { /* attribute position ran getSize() twice, so binding does too */ }
    <div className={((__yak_$b, __yak_$a)=>"input_Pair_m7uBBu" + (__yak_$a ? " input_Pair__$a_m7uBBu" : "") + (__yak_$b ? " input_Pair__$b_m7uBBu" : ""))(props.getSize(), props.getSize())}>bound: never deduplicated</div>
    { /* read by no condition: it never leaves attribute position */ }
    <div id={props.getSize()} className={"input_Boxed_m7uBBu" + (active ? " input_Boxed__$v_m7uBBu" : "")}>inlined: unread attribute stays put</div>
    { /* an arrow may move, so an event handler never forces the element-wrap */ }
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(props.roll())} onClick={()=>props.track()}>bound: handler may move</div>
    { /* the user className composes around the block, after it - which is where
        it already ran */ }
    <div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(props.roll()) + " user"}>bound: static className merge</div>
    <div className={__yak_mergeClassNames(((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(props.roll()), size)}>bound: runtime className merge</div>
    <button className={"input_MemberButton_m7uBBu" + (!(i1 % 4 !== 0) ? " input_MemberButton___m7uBBu" : "") + ("primary" === "secondary" ? " input_MemberButton___m7uBBu-01" : "") + ("primary" === "ghost" ? " input_MemberButton___m7uBBu-02" : "") + (i1 % 3 === 0 ? " input_MemberButton__p_$fullWidth_m7uBBu" : "")}>
      {i1}
    </button>
    <li key={i1} className={"input_KeyedRow_m7uBBu" + (active ? " input_KeyedRow__p_$active_m7uBBu" : "")}>
      key at the call site still folds
    </li>
    <aside className={"input_BlockBody_m7uBBu" + (active ? " input_BlockBody__$wide_m7uBBu" : "")}>block body arrow</aside>
    { /* getSize() ran between the two rolls, and may not jump the parameter
        block, so the whole element is wrapped and captures all three in
        source order */ }
    {((__yak_$a, __yak_id, __yak_$b)=><div id={__yak_id} className={"input_Pair_m7uBBu" + (__yak_$a ? " input_Pair__$a_m7uBBu" : "") + (__yak_$b ? " input_Pair__$b_m7uBBu" : "")}>
      wrapped: nothing may jump the block
    </div>)(props.roll(), props.getSize(), props.roll())}
    { /* the user className ran BEFORE the roll, and it composes around the
        block, which would run it after - so this escalates too */ }
    {((__yak_className, __yak_$v)=><div className={__yak_mergeClassNames("input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""), __yak_className)}>wrapped: className ran first</div>)(props.getSize(), props.roll())}
    { /* an unread $prop is dropped before the DOM, so its value never runs at
        all - a side effect nobody consumes, which React's purity rule already
        forbids */ }
    <div className={"input_Boxed_m7uBBu" + (active ? " input_Boxed__$v_m7uBBu" : "")}>elided: unread $prop</div>
    { /* key and children stay normal JSX on the wrapped element */ }
    {sizes.map((it)=>((__yak_disabled)=><button key={it} disabled={__yak_disabled} className={"input_ActionButton_m7uBBu" + (!__yak_disabled ? " input_ActionButton___m7uBBu" : "")}>
        wrapped in a list
      </button>)(props.isBusy()))}
  </>;
// folds: await is legal in an async server component and impure, so it is
// bound - which only works because the value never moves out of argument
// position: awaiting inside the synthesized closure would not even parse
const AsyncPage = async ()=><div className={((__yak_$v)=>"input_Boxed_m7uBBu" + (__yak_$v ? " input_Boxed__$v_m7uBBu" : ""))(await props.load())}>bound: await stays an argument</div>;
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
    <Fn $on>bails: function expression condition</Fn>
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
