import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=>{
    const show = Math.random() > 0.5;
    return <div {.../*YAK Extracted CSS:
:global(.Elem__show_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("Elem__show_m7uBBu"), "Elem_m7uBBu")({})}/>;
};
const Elem2 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.Elem2__show_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("Elem2__show_m7uBBu"), "Elem2_m7uBBu")({}))}/>;
};
const Elem3 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.Elem3__show_m7uBBu) {
  padding: 10px;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("Elem3__show_m7uBBu"), "Elem3_m7uBBu")({}))}/>;
};
const Elem4 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.Elem4__show_m7uBBu) {
  color: green;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("Elem4__show_m7uBBu"), "Elem4_m7uBBu")({}))}/>;
};
const Elem5 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.Elem5__props_show_m7uBBu) {
  color: purple;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("Elem5__props_show_m7uBBu"), "Elem5_m7uBBu")({}))}/>;
};
const Elem6 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.Elem6__props_show_m7uBBu) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("Elem6__props_show_m7uBBu"), "Elem6_m7uBBu")({}))}/>;
};
const Elem7 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css(), "Elem7_m7uBBu")({}))}/>;
};
const Elem8 = ()=>{
    const show = Math.random() > 0.5;
    return <div {.../*YAK Extracted CSS:
.Elem8_m7uBBu {
  color: var(--Elem8__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem8__color_m7uBBu": ()=>show && "red"
        }
    }, "Elem8_m7uBBu")({})}/>;
};
const Elem9 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
.Elem9_m7uBBu {
  color: var(--Elem9__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem9__color_m7uBBu": ()=>show && "red"
        }
    }, "Elem9_m7uBBu")({}))}/>;
};
const Elem10 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.Elem10_m7uBBu {
  padding: var(--Elem10__padding_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem10__padding_m7uBBu": ()=>show && "10px"
        }
    }, "Elem10_m7uBBu")({}))}/>;
};
const Elem11 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
.Elem11_m7uBBu {
  color: var(--Elem11__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem11__color_m7uBBu": ()=>show && "green"
        }
    }, "Elem11_m7uBBu")({}))}/>;
};
const Elem12 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
.Elem12_m7uBBu {
  color: var(--Elem12__color_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem12__color_m7uBBu": ()=>props.show && "purple"
        }
    }, "Elem12_m7uBBu")({}))}/>;
};
const Elem13 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
.Elem13_m7uBBu {
  font-size: var(--Elem13__font-size_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem13__font-size_m7uBBu": ()=>props.show && "16px"
        }
    }, "Elem13_m7uBBu")({}))}/>;
};
const Elem14 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*YAK Extracted CSS:
.Elem14_m7uBBu {
  display: var(--Elem14__display_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--Elem14__display_m7uBBu": ()=>props.show && "block"
        }
    }, "Elem14_m7uBBu")({}))}/>;
};
const Elem15 = (props: any)=>{
    return <div {.../*YAK Extracted CSS:
:global(.Elem15__props_a-and-props_b_m7uBBu) {
  color: var(--Elem15__color_m7uBBu);
}
*/ /*#__PURE__*/ css(()=>props.a && /*#__PURE__*/ css("Elem15__props_a_m7uBBu", ()=>props.b && /*#__PURE__*/ css("Elem15__props_a-and-props_b_m7uBBu", {
                "style": {
                    "--Elem15__color_m7uBBu": ()=>props.c && "orange"
                }
            })), "Elem15_m7uBBu")({})}/>;
};
