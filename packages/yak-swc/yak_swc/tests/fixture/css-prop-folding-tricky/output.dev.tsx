import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const on = Math.random() > 0.5;
const big = Math.random() > 0.5;
const props = {} as any;
// folds: a nested ternary becomes a nested className expression
const Nested = ()=><div className={on ? big ? /*YAK Extracted CSS:
:global(.input_Nested_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "input_Nested_m7uBBu" : /*YAK Extracted CSS:
:global(.input_Nested_m7uBBu-01) {
  color: blue;
}
*/ /*#__PURE__*/ "input_Nested_m7uBBu-01" : /*YAK Extracted CSS:
:global(.input_Nested_m7uBBu-02) {
  color: green;
}
*/ /*#__PURE__*/ "input_Nested_m7uBBu-02"}/>;
// folds: a `&&` chain with an impure condition inlines the condition into the
// className, evaluating it once
const AndChain = ()=><div className={/*YAK Extracted CSS:
:global(.input_AndChain_m7uBBu) {
  color: black;
}
:global(.input_AndChain___m7uBBu) {
  font-weight: bold;
}
:global(.input_AndChain___m7uBBu-01) {
  text-decoration: underline;
}
*/ /*#__PURE__*/ "input_AndChain_m7uBBu" + (Math.random() > 0.5 ? " input_AndChain___m7uBBu" : "") + (Math.random() > 0.5 ? " input_AndChain___m7uBBu-01" : "")}/>;
// folds: a css prop next to a `style` attribute keeps the style and folds the
// class in (style is the only mergeable attribute the fold allows)
const WithStyle = ()=><div style={{
        padding: 4
    }} className={/*YAK Extracted CSS:
:global(.input_WithStyle_m7uBBu) {
  color: teal;
}
*/ /*#__PURE__*/ "input_WithStyle_m7uBBu"}/>;
// bails: a className is not a style, so the fold hands off to the runtime merge
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "user"
    }, /*YAK Extracted CSS:
:global(.input_WithClassName_m7uBBu) {
  color: purple;
}
*/ /*#__PURE__*/ css("input_WithClassName_m7uBBu"))}/>;
// bails: className and style together keep the runtime merge
const WithBoth = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.input_WithBoth_m7uBBu) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("input_WithBoth_m7uBBu"))}/>;
// bails: a spread element may carry a className, so the fold keeps the runtime
// merge
const WithSpread = ()=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.input_WithSpread_m7uBBu) {
  color: olive;
}
*/ /*#__PURE__*/ css("input_WithSpread_m7uBBu"))}/>;
// bails: a runtime css variable is a mixed static/dynamic segment the fold
// cannot flatten, so the whole prop stays on the runtime path
const MixedDynamic = ({ color }: {
    color: string;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_MixedDynamic_m7uBBu) {
  color: var(--input_MixedDynamic__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_MixedDynamic__color_m7uBBu": ()=>color
        }
    }, "input_MixedDynamic_m7uBBu"))}/>;
