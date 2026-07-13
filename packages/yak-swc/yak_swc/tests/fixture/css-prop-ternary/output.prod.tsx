import { css, __yak_unitPostFix, __yak_mergeCssProp } from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// folds: both arms are fully static
const Elem = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? /*YAK Extracted CSS:
:global(.ym7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBu" : /*YAK Extracted CSS:
:global(.ym7uBBu1) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu1"}/>;
};
// folds: one arm carries its own condition
const Elem2 = ({ active, big }: {
    active: boolean;
    big: boolean;
})=>{
    return <div className={active ? /*YAK Extracted CSS:
:global(.ym7uBBu2) {
  color: red;
}
:global(.ym7uBBu3) {
  font-size: 20px;
}
*/ /*#__PURE__*/ "ym7uBBu2" + (big ? " ym7uBBu3" : "") : /*YAK Extracted CSS:
:global(.ym7uBBu4) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu4"}/>;
};
// stays on the runtime path: one arm holds a dynamic value
const Elem3 = ({ active, width }: {
    active: boolean;
    width: number;
})=>{
    return <div {...__yak_mergeCssProp({}, active ? /*YAK Extracted CSS:
:global(.ym7uBBu5) {
  width: var(--ym7uBBu6);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBu6": /*#__PURE__*/ __yak_unitPostFix(()=>width, "px")
        }
    }, "ym7uBBu5") : /*YAK Extracted CSS:
:global(.ym7uBBu7) {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu7"))}/>;
};
// folds: an empty arm becomes an empty string instead of a dead class
const Elem4 = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? /*#__PURE__*/ "" : /*YAK Extracted CSS:
:global(.ym7uBBu9) {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu9"}/>;
};
