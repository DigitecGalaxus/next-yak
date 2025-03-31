import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {.../*YAK Extracted CSS:
.Elem {
  color: red;
}
*/ /*#__PURE__*/ css(__styleYak.Elem)({})}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
.Elem2 {
  color: blue;
}
*/ /*#__PURE__*/ css(__styleYak.Elem2)({}))}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.Elem3 {
  padding: 10px;
}
*/ /*#__PURE__*/ css(__styleYak.Elem3)({}))}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
.Elem4 {
  color: green;
}
*/ /*#__PURE__*/ css(__styleYak.Elem4)({}))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
.Elem5 {
  color: purple;
}
*/ /*#__PURE__*/ css(__styleYak.Elem5)({}))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
.Elem6 {
  font-size: 16px;
}
*/ /*#__PURE__*/ css(__styleYak.Elem6)({}))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css(__styleYak.Elem8)({}))}/>;
const Text = /*YAK Extracted CSS:
.Text {
  font-size: 20px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p(__styleYak.Text), {
    "displayName": "Text"
});
const StyledComponentWithCSSProp = ()=><Text {.../*YAK Extracted CSS:
.StyledComponentWithCSSProp {
  color: red;
}
*/ /*#__PURE__*/ css(__styleYak.StyledComponentWithCSSProp)({})}>
    test
  </Text>;
