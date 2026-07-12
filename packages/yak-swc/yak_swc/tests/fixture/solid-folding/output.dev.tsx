// Folding for @yak/solid emits Solid's `class` attribute (React runtimes get
// `className`). Shapes which keep every evaluation inside the class attribute
// expression stay reactive in Solid; the element-wrap shape would freeze its
// bound values (a Solid component runs once), so those usages keep the runtime
// component.
import { styled, css, __yak_mergeClassNames, __yak_mergeCssProp } from "@yak/solid/internal";
import * as __yak from "@yak/solid/internal";
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
// a bound non-$ prop needs the element-wrap shape, which would freeze the
// value in Solid - the usage keeps the runtime component
const Row = /*YAK Extracted CSS:
:global(.input_Row__disabled_m7uBBu) {
  opacity: 0.5;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Row_m7uBBu", ({ disabled })=>disabled && /*#__PURE__*/ css("input_Row__disabled_m7uBBu")), {
    "displayName": "Row"
});
export const Wrapped = ()=><Row disabled={maybe()}/>;
// a static css prop folds into a plain class attribute
export const CssProp = ()=><p class={/*YAK Extracted CSS:
:global(.input_CssProp_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ "input_CssProp_m7uBBu"}/>;
// an existing class attribute keeps the runtime merge
export const CssPropMerge = ()=><p {...__yak_mergeCssProp({
        class: "user"
    }, /*YAK Extracted CSS:
:global(.input_CssPropMerge_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ css("input_CssPropMerge_m7uBBu"))}/>;
