// Folding for @yak/solid emits Solid's `class` attribute (React runtimes get
// `className`). Shapes which keep every evaluation inside the class attribute
// expression stay reactive in Solid; the element-wrap shape would freeze its
// bound values (a Solid component runs once), so those usages keep the runtime
// component.
import { styled, css, __yak_mergeClassNames, __yak_mergeCssProp } from "@yak/solid/internal";
import * as __yak from "@yak/solid/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTEgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTIgewogIHBhZGRpbmc6IDRweDsKfS55bTd1QkJ1MyB7CiAgcGFkZGluZzogNHB4Owp9Ci55bTd1QkJ1NCB7CiAgY29sb3I6IGJsdWU7Cn0ueW03dUJCdTYgewogIG9wYWNpdHk6IDAuNTsKfS55bTd1QkJ1NyB7CiAgY29sb3I6IGdyZWVuOwp9LnltN3VCQnU4IHsKICBjb2xvcjogZ3JlZW47Cn0=";
const someClass = ()=>"user";
const maybe = ()=>true;
export const Button = /*YAK EXPORTED STYLED:Button:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
  color: red;
}
*/ /* @refresh component */ /*#__PURE__*/ __yak.__yak_button("ym7uBBu");
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
.ym7uBBu1 {
  color: red;
}
*/ /* @refresh component */ /*#__PURE__*/ __yak.__yak_span("ym7uBBu1");
export const Extended = /*YAK EXPORTED STYLED:Extended:ym7uBBu2*//*YAK Extracted CSS:
.ym7uBBu2 {
  padding: 4px;
}
*/ /* @refresh component */ /*#__PURE__*/ __yak.__yak_span("ym7uBBu1 ym7uBBu2");
export const Chain = ()=><span class="ym7uBBu1 ym7uBBu2">hey</span>;
// the class-toggling condition folds into the class attribute, where the
// Solid compiler keeps it reactive
const Box = /*YAK Extracted CSS:
.ym7uBBu3 {
  padding: 4px;
}
.ym7uBBu4 {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu3", ({ $active })=>$active && /*#__PURE__*/ css("ym7uBBu4"));
export const Dynamic = (props: {
    active: () => boolean;
})=><div class={((__yak_$active)=>"ym7uBBu3" + (__yak_$active ? " ym7uBBu4" : ""))(props.active())}/>;
// a bound non-$ prop needs the element-wrap shape, which would freeze the
// value in Solid - the usage keeps the runtime component
const Row = /*YAK Extracted CSS:
.ym7uBBu6 {
  opacity: 0.5;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu5", ({ disabled })=>disabled && /*#__PURE__*/ css("ym7uBBu6"));
export const Wrapped = ()=><Row disabled={maybe()}/>;
// a static css prop folds into a plain class attribute
export const CssProp = ()=><p class={/*YAK Extracted CSS:
.ym7uBBu7 {
  color: green;
}
*/ /*#__PURE__*/ "ym7uBBu7"}/>;
// an existing class attribute keeps the runtime merge
export const CssPropMerge = ()=><p {...__yak_mergeCssProp({
        class: "user"
    }, /*YAK Extracted CSS:
.ym7uBBu8 {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu8"))}/>;
