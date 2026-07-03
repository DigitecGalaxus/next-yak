import { css, styled, __yak_mergeClassNames } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0NhcmRfbTd1QkJ1IHsKICBjb2xvcjogcmVkOwp9LmlucHV0X0JveF9tN3VCQnUgewogIGNvbG9yOiBibHVlOwp9LmlucHV0X1RpdGxlX203dUJCdSB7CiAgZm9udC1zaXplOiAycmVtOwp9LmlucHV0X0R5bmFtaWNfbTd1QkJ1IHsKICBjb2xvcjogdmFyKC0taW5wdXRfRHluYW1pY19fY29sb3JfbTd1QkJ1KTsKfS5pbnB1dF9XaXRoQXR0cnNfbTd1QkJ1IHsKICBjb2xvcjogZ3JlZW47Cn0uaW5wdXRfRXh0ZW5kZWRfbTd1QkJ1IHsKICBjb2xvcjogeWVsbG93Owp9LmlucHV0X011dGFibGVfbTd1QkJ1IHsKICBjb2xvcjogcGluazsKfS5pbnB1dF9MYXRlX203dUJCdSB7CiAgY29sb3I6IGdyYXk7Cn0uaW5wdXRfT3B0aW1pemFibGVfbTd1QkJ1IHsKICBjb2xvcjogb3JhbmdlOwp9";
const someRef = {
    current: null
} as any;
const props = {} as any;
// folds
const Card = /*YAK Extracted CSS:
.input_Card_m7uBBu {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu"), {
    "displayName": "Card"
});
// folds: styled("...") string form
const Box = /*YAK Extracted CSS:
.input_Box_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled("section")("input_Box_m7uBBu"), {
    "displayName": "Box"
});
// exported: local usages fold, the declaration stays
export const Title = /*YAK EXPORTED STYLED:Title:input_Title_m7uBBu*//*YAK Extracted CSS:
.input_Title_m7uBBu {
  font-size: 2rem;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu"), {
    "displayName": "Title"
});
// bails: dynamic css
const Dynamic = /*YAK Extracted CSS:
.input_Dynamic_m7uBBu {
  color: var(--input_Dynamic__color_m7uBBu);
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Dynamic_m7uBBu", {
    "style": {
        "--input_Dynamic__color_m7uBBu": ({ $color })=>$color
    }
}), {
    "displayName": "Dynamic"
});
// bails: attrs
const WithAttrs = /*YAK Extracted CSS:
.input_WithAttrs_m7uBBu {
  color: green;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button.attrs({
    type: "button"
})("input_WithAttrs_m7uBBu"), {
    "displayName": "WithAttrs"
});
// bails: styled(Component)
const Extended = /*YAK Extracted CSS:
.input_Extended_m7uBBu {
  color: yellow;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(Card)("input_Extended_m7uBBu"), {
    "displayName": "Extended"
});
// bails: let declaration
let Mutable = /*YAK Extracted CSS:
.input_Mutable_m7uBBu {
  color: pink;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Mutable_m7uBBu"), {
    "displayName": "Mutable"
});
// folds although the declaration comes after the usage
const Early = ()=><p className="input_Late_m7uBBu">before declaration</p>;
const Late = /*YAK Extracted CSS:
.input_Late_m7uBBu {
  color: gray;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_p("input_Late_m7uBBu"), {
    "displayName": "Late"
});
const Optimizable = ({ active }: {
    active?: boolean;
})=><>
    <div className="input_Card_m7uBBu">folds</div>
    <div style={{
        margin: 1
    }} onClick={()=>{}} ref={someRef} data-x="1" className="input_Card_m7uBBu">
      forwards attributes
    </div>
    <div className="input_Card_m7uBBu user">static class name merge</div>
    <div className={__yak_mergeClassNames("input_Card_m7uBBu", active && "active")}>runtime class name merge</div>
    <div $foo="forwarded" className="input_Card_m7uBBu">$props are not filtered</div>
    <div className={/*YAK Extracted CSS:
.input_Optimizable_m7uBBu {
  color: orange;
}
*/ /*#__PURE__*/ "input_Card_m7uBBu input_Optimizable_m7uBBu"}>
      css prop merge
    </div>
    <div className="input_Card_m7uBBu">
      <section className="input_Box_m7uBBu"/>
    </div>
    <h1 className="input_Title_m7uBBu">folds</h1>
  </>;
const NotOptimizable = ()=><>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Card<any>>bails: type arguments</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <Extended>bails</Extended>
    <Mutable>bails</Mutable></>;
const Shadowed = ()=>{
    const Card = (p: any)=><span {...p}/>;
    return <Card>bails: shadowed local</Card>;
};
