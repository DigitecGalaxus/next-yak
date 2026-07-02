import { css, __yak_unitPostFix, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// folds: both arms are fully static
const Elem = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? "input_Elem_m7uBBu" : "input_Elem_m7uBBu-01"}/>;
};
// folds: one arm carries its own condition
const Elem2 = ({ active, big }: {
    active: boolean;
    big: boolean;
})=>{
    return <div className={active ? "input_Elem2_m7uBBu" + (big ? " input_Elem2__big_m7uBBu" : "") : "input_Elem2_m7uBBu-01"}/>;
};
// stays on the runtime path: one arm holds a dynamic value
const Elem3 = ({ active, width }: {
    active: boolean;
    width: number;
})=>{
    return <div {...__yak_mergeCssProp({}, active ? /*YAK Extracted CSS:
:global(.input_Elem3_m7uBBu) {
  width: var(--input_Elem3__width_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem3__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(()=>width, "px")
        }
    }, "input_Elem3_m7uBBu") : /*YAK Extracted CSS:
:global(.input_Elem3_m7uBBu-01) {
  color: blue;
}
*/ /*#__PURE__*/ css("input_Elem3_m7uBBu-01"))}/>;
};
