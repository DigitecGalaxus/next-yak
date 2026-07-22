import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X1RvZ2dsZV9tN3VCQnUgewogIGNvbG9yOiBibGFjazsKfQouaW5wdXRfVG9nZ2xlX19cJG9uX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfS5pbnB1dF9SYW5nZV9fXCRhX203dUJCdSB7CiAgY29sb3I6IHJlZDsKfQouaW5wdXRfUmFuZ2VfX1wkYl9tN3VCQnUgewogIGNvbG9yOiBibHVlOwp9LmlucHV0X0FjdGlvbkJ1dHRvbl9fX203dUJCdSB7CiAgY3Vyc29yOiBwb2ludGVyOwp9LmlucHV0X0NhcmRfbTd1QkJ1IHsKICBjb2xvcjogZ3JlZW47Cn0uaW5wdXRfRmFuY3lfbTd1QkJ1IHsKICBwYWRkaW5nOiA0cHg7Cn0uaW5wdXRfV2l0aEF0dHJzX203dUJCdSB7CiAgY29sb3I6IGJsdWU7Cn0uaW5wdXRfTXV0YWJsZV9tN3VCQnUgewogIGNvbG9yOiB0ZWFsOwp9";
const on = Math.random() > 0.5;
const props = {} as any;
const cn = (value: unknown)=>String(value);
const x = {};
const f = ()=>Math.random() > 0.5;
const g = ()=>"id-value";
// dynamic component: a class-toggling $prop drives the conditional class
const Toggle = /*YAK Extracted CSS:
.input_Toggle_m7uBBu {
  color: black;
}
.input_Toggle__\$on_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Toggle_m7uBBu", ({ $on })=>$on && /*#__PURE__*/ css("input_Toggle__$on_m7uBBu")), {
    "displayName": "Toggle"
});
// dynamic component reading two $props, to place an impure obstacle between the
// bound props
const Range = /*YAK Extracted CSS:
.input_Range__\$a_m7uBBu {
  color: red;
}
.input_Range__\$b_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Range_m7uBBu", ({ $a })=>$a && /*#__PURE__*/ css("input_Range__$a_m7uBBu"), ({ $b })=>$b && /*#__PURE__*/ css("input_Range__$b_m7uBBu")), {
    "displayName": "Range"
});
// dynamic component whose condition reads a non-$ prop that also stays on the
// DOM element
const ActionButton = /*YAK Extracted CSS:
.input_ActionButton___m7uBBu {
  cursor: pointer;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_ActionButton_m7uBBu", ({ disabled })=>!disabled && /*#__PURE__*/ css("input_ActionButton___m7uBBu")), {
    "displayName": "ActionButton"
});
// static component for the plain className merges
const Card = /*YAK Extracted CSS:
.input_Card_m7uBBu {
  color: green;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu"), {
    "displayName": "Card"
});
// styled(Component) wrapper folds to the wrapped component
const Fancy = /*YAK Extracted CSS:
.input_Fancy_m7uBBu {
  padding: 4px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Card)("input_Fancy_m7uBBu"), {
    "displayName": "Fancy"
});
// bails: an .attrs() chain is never registered as foldable
const WithAttrs = /*YAK Extracted CSS:
.input_WithAttrs_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_input.attrs({
    type: "text"
})("input_WithAttrs_m7uBBu"), {
    "displayName": "WithAttrs"
});
// bails: a let binding can be reassigned, so its usages keep the runtime path
let Mutable = /*YAK Extracted CSS:
.input_Mutable_m7uBBu {
  color: teal;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Mutable_m7uBBu"), {
    "displayName": "Mutable"
});
const Cases = ()=><>
    { /* boolean shorthand $prop resolves to true */ }
    <button className={"input_Toggle_m7uBBu" + (true ? " input_Toggle__$on_m7uBBu" : "")}>shorthand</button>

    { /* $prop bound from an impure value: ClassNameIife, only the class sees it */ }
    <button className={((__yak_$on)=>"input_Toggle_m7uBBu" + (__yak_$on ? " input_Toggle__$on_m7uBBu" : ""))(f())}>bound transient prop</button>

    { /* an impure attr after the only bound $prop sits outside the class slot
        span, so the cheap ClassNameIife shape holds */ }
    <button className={((__yak_$on)=>"input_Toggle_m7uBBu" + (__yak_$on ? " input_Toggle__$on_m7uBBu" : ""))(f())} id={g()}>
      obstacle outside the span stays cheap
    </button>

    { /* an impure attr between two bound $props cannot be jumped: element wrap */ }
    {((__yak_$a, __yak_id, __yak_$b)=><span id={__yak_id} className={"input_Range_m7uBBu" + (__yak_$a ? " input_Range__$a_m7uBBu" : "") + (__yak_$b ? " input_Range__$b_m7uBBu" : "")}>
      obstacle between props forces the wrap
    </span>)(f(), g(), f())}

    { /* a bound non-$ prop stays on the element and reaches the class: element wrap */ }
    {((__yak_disabled)=><button disabled={__yak_disabled} className={"input_ActionButton_m7uBBu" + (!__yak_disabled ? " input_ActionButton___m7uBBu" : "")}>disabled forces the wrap</button>)(f())}

    { /* runtime className value merges with the dynamic class via mergeClassNames */ }
    <button className={__yak_mergeClassNames("input_Toggle_m7uBBu" + (on ? " input_Toggle__$on_m7uBBu" : ""), cn(x))}>
      runtime className merge
    </button>

    { /* a className that ran before the bound prop wraps the element */ }
    {((__yak_className, __yak_$on)=><button className={__yak_mergeClassNames("input_Toggle_m7uBBu" + (__yak_$on ? " input_Toggle__$on_m7uBBu" : ""), __yak_className)}>
      className composes before the prop
    </button>)(cn(x), f())}

    { /* static component: a string className merges at compile time */ }
    <div className="input_Card_m7uBBu user">static merge</div>

    { /* styled(Component) usage folds to Card with the merged class */ }
    <Card className="input_Fancy_m7uBBu extra">wrapper fold</Card>

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
