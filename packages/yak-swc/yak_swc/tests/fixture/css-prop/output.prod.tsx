import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div className={/*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBu"}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
const Elem3 = ()=><div style={{
        padding: "5px"
    }} className={/*YAK Extracted CSS:
:global(.ym7uBBu2) {
  padding: 10px;
}
*/ /*#__PURE__*/ "ym7uBBu2"}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu3"))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: purple;
}
*/ /*#__PURE__*/ css("ym7uBBu4"))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("ym7uBBu5"))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css("ym7uBBu6"))}/>;
const Elem9 = ()=><div className={/*#__PURE__*/ "ym7uBBu7"}/>;
const Elem10 = ({ on }: {
    on: boolean;
})=><div className={/*YAK Extracted CSS:
:global(.ym7uBBu9) {
  color: red;
}
:global(.ym7uBBuA) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu8" + (on ? " ym7uBBu9" : " ym7uBBuA")}/>;
const Elem11 = ({ on }: {
    on: boolean;
})=><div className={on ? /*YAK Extracted CSS:
:global(.ym7uBBuB) {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBuB" : /*YAK Extracted CSS:
:global(.ym7uBBuC) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBuC"}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBuD) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBuD");
const StyledComponentWithCSSProp = ()=><Text className={/*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBuE"}>
    test
  </Text>;
