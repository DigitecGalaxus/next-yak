import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div className={/*YAK Extracted CSS:
:global(.input_Elem_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "input_Elem_m7uBBu"}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.input_Elem2_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ css("input_Elem2_m7uBBu"))}/>;
const Elem3 = ()=><div style={{
        padding: "5px"
    }} className={/*YAK Extracted CSS:
:global(.input_Elem3_m7uBBu) {
  padding: 10px;
}
*/ /*#__PURE__*/ "input_Elem3_m7uBBu"}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.input_Elem4_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ css("input_Elem4_m7uBBu"))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.input_Elem5_m7uBBu) {
  color: purple;
}
*/ /*#__PURE__*/ css("input_Elem5_m7uBBu"))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.input_Elem6_m7uBBu) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("input_Elem6_m7uBBu"))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css("input_Elem8_m7uBBu"))}/>;
const Elem9 = ()=><div className={/*#__PURE__*/ "input_Elem9_m7uBBu"}/>;
const Elem10 = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
:global(.input_Elem10__on_m7uBBu) {
  color: red;
}
:global(.input_Elem10__not_on_m7uBBu) {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem10_m7uBBu" + (on ? " input_Elem10__on_m7uBBu" : " input_Elem10__not_on_m7uBBu")}/>;
const Elem11 = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
:global(.input_Elem11_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "input_Elem11_m7uBBu" : /*YAK Extracted CSS:
:global(.input_Elem11_m7uBBu-01) {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem11_m7uBBu-01"}/>;
const Text = /*YAK Extracted CSS:
:global(.input_Text_m7uBBu) {
  font-size: 20px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Text_m7uBBu"), {
    "displayName": "Text"
});
const StyledComponentWithCSSProp = ()=><p className={/*YAK Extracted CSS:
:global(.input_StyledComponentWithCSSProp_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "input_Text_m7uBBu input_StyledComponentWithCSSProp_m7uBBu"}>
    test
  </p>;
