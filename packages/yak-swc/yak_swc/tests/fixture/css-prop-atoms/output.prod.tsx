import { styled, atoms } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=><div {...atoms("mb-8 flex flex-col")({})}/>;
const Elem2 = ()=><div {...atoms("mb-8 flex flex-col")({
        className: "test-class"
    })}/>;
const Elem3 = ()=><div {...atoms("mb-8 flex flex-col")({
        style: {
            padding: "5px"
        }
    })}/>;
const Elem4 = (props: any)=><div {...atoms("mb-8 flex flex-col")({
        ...props
    })}/>;
const Elem5 = (props: any)=><div {...atoms("mb-8 flex flex-col")({
        ...props.a,
        ...props.b
    })}/>;
const Elem6 = ()=><div {...atoms("mb-8 flex flex-col")({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    })}/>;
const Elem7 = ()=><div className="no-css"/>;
const Elem8 = ()=><div {...atoms("")({
        className: "empty-css"
    })}/>;
const Elem9 = (isSomething: boolean)=><div {...atoms("flex gap-4", isSomething ? "basis-8/12" : "w-full")({})}/>;
const Text = /*YAK Extracted CSS:
:global(.ym7uBBu) {
  font-size: 20px;
}
*/ /*#__PURE__*/ __yak.__yak_p("ym7uBBu");
const StyledComponentWithCSSProp = ()=><Text {...atoms("mb-8 flex flex-col")({})}>test</Text>;
