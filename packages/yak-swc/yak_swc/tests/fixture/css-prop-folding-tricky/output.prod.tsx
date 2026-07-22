import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const on = Math.random() > 0.5;
const big = Math.random() > 0.5;
const props = {} as any;
// folds: a nested ternary becomes a nested className expression
const Nested = ()=><div className={on ? big ? /*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBu" : /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu1" : /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  color: green;
}
*/ /*#__PURE__*/ "ym7uBBu2"}/>;
// folds: a `&&` chain with an impure condition inlines the condition into the
// className, evaluating it once
const AndChain = ()=><div className={/*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: black;
}
:global(.ym7uBBu4) {
  font-weight: bold;
}
:global(.ym7uBBu5) {
  text-decoration: underline;
}
*/ /*#__PURE__*/ "ym7uBBu3" + (Math.random() > 0.5 ? " ym7uBBu4" : "") + (Math.random() > 0.5 ? " ym7uBBu5" : "")}/>;
// folds: a css prop next to a `style` attribute keeps the style and folds the
// class in (style is the only mergeable attribute the fold allows)
const WithStyle = ()=><div style={{
        padding: 4
    }} className={/*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: teal;
}
*/ /*#__PURE__*/ "ym7uBBu6"}/>;
// bails: a className is not a style, so the fold hands off to the runtime merge
const WithClassName = ()=><div {...__yak_mergeCssProp({
        className: "user"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: purple;
}
*/ /*#__PURE__*/ css("ym7uBBu7"))}/>;
// bails: className and style together keep the runtime merge
const WithBoth = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu8) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("ym7uBBu8"))}/>;
// bails: a spread element may carry a className, so the fold keeps the runtime
// merge
const WithSpread = ()=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.ym7uBBu9) {
  color: olive;
}
*/ /*#__PURE__*/ css("ym7uBBu9"))}/>;
// bails: a runtime css variable is a mixed static/dynamic segment the fold
// cannot flatten, so the whole prop stays on the runtime path
const MixedDynamic = ({ color }: {
    color: string;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBuA) {
  color: var(--ym7uBBuB);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuB": ()=>color
        }
    }, "ym7uBBuA"))}/>;
