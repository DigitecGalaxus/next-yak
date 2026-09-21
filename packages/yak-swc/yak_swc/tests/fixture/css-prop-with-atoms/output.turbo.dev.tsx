import { css, styled, atoms, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X1RleHRfbTd1QkJ1IHsKICBmb250LXNpemU6IDIwcHg7Cn0uaW5wdXRfQ3NzQW5kQXRvbXNfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9";
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
.input_Text_m7uBBu {
  font-size: 20px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Text_m7uBBu"), {
    "displayName": "Text"
});
const StyledComponentWithCSSProp = ()=><Text {...__yak_mergeCssProp(atoms("red"))}>test</Text>;
const CssAndAtoms = ()=><div {...__yak_mergeCssProp(/*YAK Extracted CSS:
.input_CssAndAtoms_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ css(atoms("yellow"), "input_CssAndAtoms_m7uBBu"), {
        className: "test-class"
    })}/>;
