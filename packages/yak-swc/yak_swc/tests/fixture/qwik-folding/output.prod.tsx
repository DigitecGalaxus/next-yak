// Folding for @yak/qwik emits Qwik's `class` attribute (React runtimes get
// `className`). A Qwik component's render function re-runs like React's, so
// every fold shape applies, the element-wrap included: it re-evaluates with
// the parent instead of binding one attribute to a signal.
import { styled, css, __yak_mergeClassNames, __yak_mergeCssProp } from "@yak/qwik/internal";
import * as __yak from "@yak/qwik/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const someClass = ()=>"user";
const maybe = ()=>true;
export const Button = /*YAK EXPORTED STYLED:Button:ym7uBBu*//*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu");
export const Static = ()=><section>
    { /* folds into <button class="..."> */ }
    <button type="button" class="ym7uBBu">click</button>
    { /* a user class string merges at compile time */ }
    <button class={"ym7uBBu user"}>merged</button>
    { /* a user class expression merges through the runtime helper */ }
    <button class={__yak_mergeClassNames("ym7uBBu", someClass())}>runtime merged</button>
  </section>;
// a styled(Parent) chain of static components collapses to the element
export const Base = /*YAK EXPORTED STYLED:Base:ym7uBBu1*//*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu1");
export const Extended = /*YAK EXPORTED STYLED:Extended:ym7uBBu2*//*YAK Extracted CSS:
:global(.ym7uBBu2) {
  padding: 4px;
}
*/ /*#__PURE__*/ __yak.__yak_span("ym7uBBu1 ym7uBBu2");
export const Chain = ()=><span class="ym7uBBu1 ym7uBBu2">hey</span>;
// the class-toggling condition folds into the class attribute, where the
// Solid compiler keeps it reactive
const Box = /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  padding: 4px;
}
:global(.ym7uBBu4) {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu4"));
export const Dynamic = (props: {
    active: () => boolean;
})=><div class={((__yak_$active)=>"ym7uBBu3" + (__yak_$active ? " ym7uBBu4" : ""))(props.active())}/>;
// a bound non-$ prop takes the element-wrap shape, as on React
const Row = /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  opacity: 0.5;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu5", ({ disabled })=>disabled && /*#__PURE__*/ css("ym7uBBu6"));
export const Wrapped = ()=>((__yak_disabled)=><div disabled={__yak_disabled} class={"ym7uBBu5" + (__yak_disabled ? " ym7uBBu6" : "")}/>)(maybe());
// a namespaced attribute such as q:slot keeps the runtime component for now
// (the fold does not analyse namespaced names; a follow-up can pass them through)
export const Slotted = ()=><Button q:slot="header">slot</Button>;
// a keyed usage in a list keeps its key on the folded element
const ids = [
    "a",
    "b"
];
export const Keyed = ()=><ul>
    {ids.map((id)=><button key={id} class="ym7uBBu">{id}</button>)}
  </ul>;
// a static css prop folds into a plain class attribute
export const CssProp = ()=><p class={/*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: green;
}
*/ /*#__PURE__*/ "ym7uBBu7"}/>;
// an existing class attribute keeps the runtime merge
export const CssPropMerge = ()=><p {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu8"), {
        class: "user"
    })}/>;
