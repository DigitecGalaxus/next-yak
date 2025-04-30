import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {.../*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu")({})}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1")({}))}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  padding: 10px;
}
*/ /*#__PURE__*/ css("ym7uBBu2")({}))}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu3")({}))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: purple;
}
*/ /*#__PURE__*/ css("ym7uBBu4")({}))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("ym7uBBu5")({}))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css("ym7uBBu6")({}))}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu7");
const StyledComponentWithCSSProp = ()=><Text {.../*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu8")({})}>
    test
  </Text>;
