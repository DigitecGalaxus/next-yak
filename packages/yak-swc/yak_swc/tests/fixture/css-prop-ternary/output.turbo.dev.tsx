import { css, __yak_unitPostFix, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0VsZW1fbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X0VsZW1fbTd1QkJ1LTAxIHsKICBjb2xvcjogYmx1ZTsKfS5pbnB1dF9FbGVtMl9tN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0KLmlucHV0X0VsZW0yX19iaWdfbTd1QkJ1IHsKICBmb250LXNpemU6IDIwcHg7Cn0uaW5wdXRfRWxlbTJfbTd1QkJ1LTAxIHsKICBjb2xvcjogYmx1ZTsKfS5pbnB1dF9FbGVtM19tN3VCQnUgewogIHdpZHRoOiB2YXIoLS1pbnB1dF9FbGVtM19fd2lkdGhfbTd1QkJ1KTsKfS5pbnB1dF9FbGVtM19tN3VCQnUtMDEgewogIGNvbG9yOiBibHVlOwp9LmlucHV0X0VsZW00X203dUJCdS0wMSB7CiAgY29sb3I6IGJsdWU7Cn0uaW5wdXRfRWxlbTZfX25vdF9hY3RpdmVfbTd1QkJ1IHsKICBjb2xvcjogYmx1ZTsKfQ==";
// folds: both arms are fully static
const Elem = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? /*YAK Extracted CSS:
.input_Elem_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ "input_Elem_m7uBBu" : /*YAK Extracted CSS:
.input_Elem_m7uBBu-01 {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem_m7uBBu-01"}/>;
};
// folds: one arm carries its own condition
const Elem2 = ({ active, big }: {
    active: boolean;
    big: boolean;
})=>{
    return <div className={active ? /*YAK Extracted CSS:
.input_Elem2_m7uBBu {
  color: red;
}
.input_Elem2__big_m7uBBu {
  font-size: 20px;
}
*/ /*#__PURE__*/ "input_Elem2_m7uBBu" + (big ? " input_Elem2__big_m7uBBu" : "") : /*YAK Extracted CSS:
.input_Elem2_m7uBBu-01 {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem2_m7uBBu-01"}/>;
};
// stays on the runtime path: one arm holds a dynamic value
const Elem3 = ({ active, width }: {
    active: boolean;
    width: number;
})=>{
    return <div {...__yak_mergeCssProp({}, active ? /*YAK Extracted CSS:
.input_Elem3_m7uBBu {
  width: var(--input_Elem3__width_m7uBBu);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--input_Elem3__width_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(()=>width, "px")
        }
    }, "input_Elem3_m7uBBu") : /*YAK Extracted CSS:
.input_Elem3_m7uBBu-01 {
  color: blue;
}
*/ /*#__PURE__*/ css("input_Elem3_m7uBBu-01"))}/>;
};
// folds: an empty arm becomes an empty string instead of a dead class
const Elem4 = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? "" : /*YAK Extracted CSS:
.input_Elem4_m7uBBu-01 {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem4_m7uBBu-01"}/>;
};
// folds: a nested empty mixin contributes nothing instead of keeping the
// whole css prop on the runtime path - the outer class is still minted as
// the template carries dynamic content
const Elem5 = ({ active }: {
    active: boolean;
})=>{
    return <div className={/*#__PURE__*/ "input_Elem5_m7uBBu" + (active ? "" : "")}/>;
};
// folds: a nested empty ternary arm becomes an empty string
const Elem6 = ({ active }: {
    active: boolean;
})=>{
    return <div className={/*YAK Extracted CSS:
.input_Elem6__not_active_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ "input_Elem6_m7uBBu" + (active ? "" : " input_Elem6__not_active_m7uBBu")}/>;
};
