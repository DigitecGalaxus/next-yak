import { css, styled, atoms, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...__yak_mergeCssProp({}, atoms("yellow"))}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, atoms("blue"))}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, atoms("padding"))}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, atoms("green"))}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, atoms("purple"))}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, atoms("font-size"))}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, atoms("empty-css"))}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu");
const StyledComponentWithCSSProp = ()=><Text {...__yak_mergeCssProp({}, atoms("red"))}>test</Text>;
const CssAndAtoms = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: red;
}
*/ /*#__PURE__*/ css(atoms("yellow"), "ym7uBBu1"))}/>;
