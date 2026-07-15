import { css, __yak_unitPostFix, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0ueW03dUJCdTEgewogIGNvbG9yOiBibHVlOwp9LnltN3VCQnUyIHsKICBjb2xvcjogcmVkOwp9Ci55bTd1QkJ1MyB7CiAgZm9udC1zaXplOiAyMHB4Owp9LnltN3VCQnU0IHsKICBjb2xvcjogYmx1ZTsKfS55bTd1QkJ1NSB7CiAgd2lkdGg6IHZhcigtLXltN3VCQnU2KTsKfS55bTd1QkJ1NyB7CiAgY29sb3I6IGJsdWU7Cn0ueW03dUJCdTkgewogIGNvbG9yOiBibHVlOwp9";
// folds: both arms are fully static
const Elem = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? /*YAK Extracted CSS:
.ym7uBBu {
  color: red;
}
*/ /*#__PURE__*/ "ym7uBBu" : /*YAK Extracted CSS:
.ym7uBBu1 {
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
.ym7uBBu2 {
  color: red;
}
.ym7uBBu3 {
  font-size: 20px;
}
*/ /*#__PURE__*/ "ym7uBBu2" + (big ? " ym7uBBu3" : "") : /*YAK Extracted CSS:
.ym7uBBu4 {
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
.ym7uBBu5 {
  width: var(--ym7uBBu6);
}
*/ /*#__PURE__*/ css({
        "style": {
            "--ym7uBBu6": /*#__PURE__*/ __yak_unitPostFix(()=>width, "px")
        }
    }, "ym7uBBu5") : /*YAK Extracted CSS:
.ym7uBBu7 {
  color: blue;
}
*/ /*#__PURE__*/ css("ym7uBBu7"))}/>;
};
// folds: an empty arm becomes an empty string instead of a dead class
const Elem4 = ({ active }: {
    active: boolean;
})=>{
    return <div className={active ? "" : /*YAK Extracted CSS:
.ym7uBBu9 {
  color: blue;
}
*/ /*#__PURE__*/ "ym7uBBu9"}/>;
};
