import { css, styled, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu"))}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu1"), {
        className: "test-class"
    })}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu2) {
  padding: 10px;
}
*/ /*#__PURE__*/ css("ym7uBBu2"), {
        style: {
            padding: "5px"
        }
    })}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: green;
}
*/ /*#__PURE__*/ css("ym7uBBu3"), props)}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: purple;
}
*/ /*#__PURE__*/ css("ym7uBBu4"), props.a, props.b)}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu5) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css("ym7uBBu5"), {
        className: "main",
        style: {
            fontWeight: "bold"
        }
    })}/>;
const ElemEntity = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu6) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu6"), {
        className: "Food & Drink"
    })}/>;
const ElemBackslash = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu7"), {
        className: "before:content-['\\2713']"
    })}/>;
const ElemEmoji = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu8) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu8"), {
        className: "🔥 mark"
    })}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div className="empty-css"/>;
const Elem9 = ()=><div/>;
const Elem10 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBuC) {
  color: red;
}
:global(.ym7uBBuD) {
  color: blue;
}
*/ /*#__PURE__*/ css(()=>on ? /*#__PURE__*/ css("ym7uBBuC") : /*#__PURE__*/ css("ym7uBBuD"), "ym7uBBuB"))}/>;
const Elem11 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp(on ? /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBuE") as any : /*YAK Extracted CSS:
:global(.ym7uBBuF) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBuF"))}/>;
const Elem12 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp(on && /*YAK Extracted CSS:
:global(.ym7uBBuG) {
  color: brown;
}
*/ /*#__PURE__*/ css("ym7uBBuG"))}/>;
const Elem13 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp(on ? /*YAK Extracted CSS:
:global(.ym7uBBuH) {
  color: teal;
}
*/ /*#__PURE__*/ css("ym7uBBuH") : null)}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBuI) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBuI");
const StyledComponentWithCSSProp = ()=><Text {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBuJ) {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBuJ"))}>
    test
  </Text>;
