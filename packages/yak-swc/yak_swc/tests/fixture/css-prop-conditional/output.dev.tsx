import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_Elem__show_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("input_Elem__show_m7uBBu"), "input_Elem_m7uBBu"))}/>;
};
const Elem2 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.input_Elem2__show_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("input_Elem2__show_m7uBBu"), "input_Elem2_m7uBBu"))}/>;
};
const Elem3 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.input_Elem3__show_m7uBBu) {
  padding: 10px;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("input_Elem3__show_m7uBBu"), "input_Elem3_m7uBBu"))}/>;
};
const Elem4 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.input_Elem4__show_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("input_Elem4__show_m7uBBu"), "input_Elem4_m7uBBu"))}/>;
};
const Elem5 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.input_Elem5__props_show_m7uBBu) {
  color: purple;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("input_Elem5__props_show_m7uBBu"), "input_Elem5_m7uBBu"))}/>;
};
const Elem6 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.input_Elem6__props_show_m7uBBu) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("input_Elem6__props_show_m7uBBu"), "input_Elem6_m7uBBu"))}/>;
};
const Elem7 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css(), "input_Elem7_m7uBBu"))}/>;
};
const Elem8 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_Elem8_m7uBBu) {
  color: var(--input_Elem8__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem8__color_m7uBBu": ()=>show && "red"
        }
    }, "input_Elem8_m7uBBu"))}/>;
};
const Elem9 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.input_Elem9_m7uBBu) {
  color: var(--input_Elem9__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem9__color_m7uBBu": ()=>show && "red"
        }
    }, "input_Elem9_m7uBBu"))}/>;
};
const Elem10 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.input_Elem10_m7uBBu) {
  padding: var(--input_Elem10__padding_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem10__padding_m7uBBu": ()=>show && "10px"
        }
    }, "input_Elem10_m7uBBu"))}/>;
};
const Elem11 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.input_Elem11_m7uBBu) {
  color: var(--input_Elem11__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem11__color_m7uBBu": ()=>show && "green"
        }
    }, "input_Elem11_m7uBBu"))}/>;
};
const Elem12 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.input_Elem12_m7uBBu) {
  color: var(--input_Elem12__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem12__color_m7uBBu": ()=>props.show && "purple"
        }
    }, "input_Elem12_m7uBBu"))}/>;
};
const Elem13 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.input_Elem13_m7uBBu) {
  font-size: var(--input_Elem13__font-size_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem13__font-size_m7uBBu": ()=>props.show && "16px"
        }
    }, "input_Elem13_m7uBBu"))}/>;
};
const Elem14 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*YAK Extracted CSS:
:global(.input_Elem14_m7uBBu) {
  display: var(--input_Elem14__display_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem14__display_m7uBBu": ()=>props.show && "block"
        }
    }, "input_Elem14_m7uBBu"))}/>;
};
const Elem15 = (props: any)=>{
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.input_Elem15__props_a-and-props_b_m7uBBu) {
  color: var(--input_Elem15__color_m7uBBu);
}
*/ /*#__PURE__*/ css(()=>props.a && /*#__PURE__*/ css("input_Elem15__props_a_m7uBBu", ()=>props.b && /*#__PURE__*/ css("input_Elem15__props_a-and-props_b_m7uBBu", {
                "style": {
                    "--input_Elem15__color_m7uBBu": ()=>props.c && "orange"
                }
            })), "input_Elem15_m7uBBu"))}/>;
};
