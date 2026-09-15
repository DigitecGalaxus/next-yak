// Folding for @yak/qwik emits Qwik's `class` attribute (React runtimes get
// `className`). A Qwik component's render function re-runs like React's, so
// every fold shape applies, the element-wrap included: it re-evaluates with
// the parent instead of binding one attribute to a signal.
import { styled, css, __yak_mergeClassNames, __yak_mergeCssProp } from "@yak/qwik/internal";
import * as __yak from "@yak/qwik/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const someClass = ()=>"user";
const maybe = ()=>true;
export const Button = /*YAK EXPORTED STYLED:Button:input_Button_m7uBBu*//*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu"), {
    "displayName": "Button"
});
export const Static = ()=><section>
    { /* folds into <button class="..."> */ }
    <button type="button" class="input_Button_m7uBBu">click</button>
    { /* a user class string merges at compile time */ }
    <button class={"input_Button_m7uBBu user"}>merged</button>
    { /* a user class expression merges through the runtime helper */ }
    <button class={__yak_mergeClassNames("input_Button_m7uBBu", someClass())}>runtime merged</button>
  </section>;
// a styled(Parent) chain of static components collapses to the element
export const Base = /*YAK EXPORTED STYLED:Base:input_Base_m7uBBu*//*YAK Extracted CSS:
:global(.input_Base_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Base_m7uBBu"), {
    "displayName": "Base"
});
export const Extended = /*YAK EXPORTED STYLED:Extended:input_Extended_m7uBBu*//*YAK Extracted CSS:
:global(.input_Extended_m7uBBu) {
  padding: 4px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_span("input_Base_m7uBBu input_Extended_m7uBBu"), {
    "displayName": "Extended"
});
export const Chain = ()=><span class="input_Base_m7uBBu input_Extended_m7uBBu">hey</span>;
// the class-toggling condition folds into the class attribute, where the
// Solid compiler keeps it reactive
const Box = /*YAK Extracted CSS:
:global(.input_Box_m7uBBu) {
  padding: 4px;
}
:global(.input_Box__\$active_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Box_m7uBBu", ({ $active })=>$active && /*#__PURE__*/ css("input_Box__$active_m7uBBu")), {
    "displayName": "Box"
});
export const Dynamic = (props: {
    active: () => boolean;
})=><div class={((__yak_$active)=>"input_Box_m7uBBu" + (__yak_$active ? " input_Box__$active_m7uBBu" : ""))(props.active())}/>;
// a bound non-$ prop takes the element-wrap shape, as on React
const Row = /*YAK Extracted CSS:
:global(.input_Row__disabled_m7uBBu) {
  opacity: 0.5;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Row_m7uBBu", ({ disabled })=>disabled && /*#__PURE__*/ css("input_Row__disabled_m7uBBu")), {
    "displayName": "Row"
});
export const Wrapped = ()=>((__yak_disabled)=><div disabled={__yak_disabled} class={"input_Row_m7uBBu" + (__yak_disabled ? " input_Row__disabled_m7uBBu" : "")}/>)(maybe());
// a namespaced attribute such as q:slot keeps the runtime component for now
// (the fold does not analyse namespaced names; a follow-up can pass them through)
export const Slotted = ()=><Button q:slot="header">slot</Button>;
// a keyed usage in a list keeps its key on the folded element
const ids = [
    "a",
    "b"
];
export const Keyed = ()=><ul>
    {ids.map((id)=><button key={id} class="input_Button_m7uBBu">{id}</button>)}
  </ul>;
// a static css prop folds into a plain class attribute
export const CssProp = ()=><p class={/*YAK Extracted CSS:
:global(.input_CssProp_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ "input_CssProp_m7uBBu"}/>;
// an existing class attribute keeps the runtime merge
export const CssPropMerge = ()=><p {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.input_CssPropMerge_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ css("input_CssPropMerge_m7uBBu"), {
        class: "user"
    })}/>;
