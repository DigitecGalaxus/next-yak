import { styled, atoms, __yak_mergeCssProp } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...atoms("mb-8 flex flex-col")()}/>;
const Elem2 = ()=><div {...__yak_mergeCssProp({
        className: "test-class"
    }, atoms("mb-8 flex flex-col")())}/>;
const Elem3 = ()=><div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, atoms("mb-8 flex flex-col")())}/>;
const Elem4 = (props: any)=><div {...__yak_mergeCssProp({
        ...props
    }, atoms("mb-8 flex flex-col")())}/>;
const Elem5 = (props: any)=><div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, atoms("mb-8 flex flex-col")())}/>;
const Elem6 = ()=><div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, atoms("mb-8 flex flex-col")())}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...__yak_mergeCssProp({
        className: "empty-css"
    }, atoms("")())}/>;
const Elem9 = (isSomething: boolean)=><div {...atoms("flex gap-4", isSomething ? "basis-8/12" : "w-full")()}/>;
const Text = /*YAK Extracted CSS:
.Text {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p(__styleYak.Text);
const StyledComponentWithCSSProp = ()=><Text {...atoms("mb-8 flex flex-col")()}>test</Text>;
