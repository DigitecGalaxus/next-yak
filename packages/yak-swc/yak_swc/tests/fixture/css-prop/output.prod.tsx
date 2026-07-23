import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu"))}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  padding: 10px;
}
*/ /*#__PURE__*/ css("ym7uBBu2"))}/>;
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
const ElemEntity = ()=><div {...__yak_mergeCssProp({
        className: "Food & Drink"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu6"))}/>;
const ElemBackslash = ()=><div {...__yak_mergeCssProp({
        className: "before:content-['\\2713']"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu7"))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div className="empty-css"/>;
const Elem9 = ()=><div/>;
const Elem10 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBuB) {
  color: red;
}
:global(.ym7uBBuC) {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("ym7uBBuB") : /*#__PURE__*/ css("ym7uBBuC"), "ym7uBBuA"))}/>;
const Elem11 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp({}, on ? /*YAK Extracted CSS:
:global(.ym7uBBuD) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBuD") as any : /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBuE"))}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBuF) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBuF");
const StyledComponentWithCSSProp = ()=><Text {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBuG) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBuG"))}>
    test
  </Text>;
