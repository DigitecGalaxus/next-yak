import { css, styled, atoms, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...__yak_mergeCssProp(atoms("yellow"))}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp(atoms("blue"), {
        className: "test-class"
    })}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp(atoms("padding"), {
        style: {
            padding: "5px"
        }
    })}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp(atoms("green"), props)}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp(atoms("purple"), props.a, props.b)}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp(atoms("font-size"), {
        className: "main",
        style: {
            fontWeight: "bold"
        }
    })}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp(atoms("empty-css"), {
        className: "empty-css"
    })}/>;
const Elem9 = ({ on }: {
    on: boolean;
})=><div {...__yak_mergeCssProp(on ? atoms("orange") : undefined)}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu");
const StyledComponentWithCSSProp = ()=><Text {...__yak_mergeCssProp(atoms("red"))}>test</Text>;
const CssAndAtoms = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: red;
}
*/ /*#__PURE__*/ css(atoms("yellow"), "ym7uBBu1"), {
        className: "test-class"
    })}/>;
