import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {.../*YAK Extracted CSS:
.Elem_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ css("Elem_m7uBBu")({})}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
.Elem2_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ css("Elem2_m7uBBu")({}))}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.Elem3_m7uBBu {
  padding: 10px;
}
*/ /*#__PURE__*/ css("Elem3_m7uBBu")({}))}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
.Elem4_m7uBBu {
  color: green;
}
*/ /*#__PURE__*/ css("Elem4_m7uBBu")({}))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
.Elem5_m7uBBu {
  color: purple;
}
*/ /*#__PURE__*/ css("Elem5_m7uBBu")({}))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
.Elem6_m7uBBu {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("Elem6_m7uBBu")({}))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css("Elem8_m7uBBu")({}))}/>;
const Text = /*YAK Extracted CSS:
:global(.Text_m7uBBu) {
  font-size: 20px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("Text_m7uBBu"), {
    "displayName": "Text"
});
const StyledComponentWithCSSProp = ()=><Text {.../*YAK Extracted CSS:
.StyledComponentWithCSSProp_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ css("StyledComponentWithCSSProp_m7uBBu")({})}>
    test
  </Text>;
