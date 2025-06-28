import { css, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Elem = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("ym7uBBu1"), "ym7uBBu"))}/>;
};
const Elem2 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBu3) {
  color: red;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("ym7uBBu3"), "ym7uBBu2"))}/>;
};
const Elem3 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  padding: 10px;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("ym7uBBu5"), "ym7uBBu4"))}/>;
};
const Elem4 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: green;
}
*/ /*#__PURE__*/ css(()=>show && /*#__PURE__*/ css("ym7uBBu7"), "ym7uBBu6"))}/>;
};
const Elem5 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.ym7uBBu9) {
  color: purple;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("ym7uBBu9"), "ym7uBBu8"))}/>;
};
const Elem6 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBuB) {
  font-size: 16px;
}
*/ /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css("ym7uBBuB"), "ym7uBBuA"))}/>;
};
const Elem7 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*#__PURE__*/ css(()=>props.show && /*#__PURE__*/ css(), "ym7uBBuC"))}/>;
};
const Elem8 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBuE) {
  color: var(--ym7uBBuF);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuF": ()=>show && "red"
        }
    }, "ym7uBBuE"))}/>;
};
const Elem9 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        className: "test-class"
    }, /*YAK Extracted CSS:
:global(.ym7uBBuG) {
  color: var(--ym7uBBuH);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuH": ()=>show && "red"
        }
    }, "ym7uBBuG"))}/>;
};
const Elem10 = ()=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBuI) {
  padding: var(--ym7uBBuJ);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuJ": ()=>show && "10px"
        }
    }, "ym7uBBuI"))}/>;
};
const Elem11 = (props: any)=>{
    const show = Math.random() > 0.5;
    return <div {...__yak_mergeCssProp({
        ...props
    }, /*YAK Extracted CSS:
:global(.ym7uBBuK) {
  color: var(--ym7uBBuL);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuL": ()=>show && "green"
        }
    }, "ym7uBBuK"))}/>;
};
const Elem12 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        ...props.a,
        ...props.b
    }, /*YAK Extracted CSS:
:global(.ym7uBBuM) {
  color: var(--ym7uBBuN);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuN": ()=>props.show && "purple"
        }
    }, "ym7uBBuM"))}/>;
};
const Elem13 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "main",
        style: {
            fontWeight: "bold"
        }
    }, /*YAK Extracted CSS:
:global(.ym7uBBuO) {
  font-size: var(--ym7uBBuP);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuP": ()=>props.show && "16px"
        }
    }, "ym7uBBuO"))}/>;
};
const Elem14 = (props: any)=>{
    return <div {...__yak_mergeCssProp({
        className: "empty-css"
    }, /*YAK Extracted CSS:
:global(.ym7uBBuQ) {
  display: var(--ym7uBBuR);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBuR": ()=>props.show && "block"
        }
    }, "ym7uBBuQ"))}/>;
};
const Elem15 = (props: any)=>{
    return <div {...__yak_mergeCssProp({}, /*YAK Extracted CSS:
:global(.ym7uBBuU) {
  color: var(--ym7uBBuV);
}
*/ /*#__PURE__*/ css(()=>props.a && /*#__PURE__*/ css("ym7uBBuT", ()=>props.b && /*#__PURE__*/ css("ym7uBBuU", {
                "style": {
                    "--ym7uBBuV": ()=>props.c && "orange"
                }
            })), "ym7uBBuS"))}/>;
};
