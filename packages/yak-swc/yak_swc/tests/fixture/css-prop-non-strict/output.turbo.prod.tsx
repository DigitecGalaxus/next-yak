import { css, __yak_mergeCssProp } from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUxIHsKICBjb2xvcjogcmVkOwp9";
// A real yak style keeps the module recognized as using next-yak, so the css
// prop below is still processed by the plugin.
const yakClass = /*#__PURE__*/ css();
// A css prop next-yak owns is still compiled and merged with className and
// style. Non-strict only changes what happens to a value it can not compile.
const Merged = ()=><div {...__yak_mergeCssProp({
        className: "theirs",
        style: {
            padding: "5px"
        }
    }, /*YAK Extracted CSS:
.ym7uBBu1 {
  color: red;
}
*/ /*#__PURE__*/ css("ym7uBBu1"))}/>;
// With strictCssProp off, a css prop value next-yak can't handle is left
// untouched instead of failing the build - useful when another library on the
// same element owns the css prop. Under the default strict mode these error
// (see the css-prop-invalid fixture).
const StringValue = ()=><div css="their-class"/>;
const Reference = (props: {
    styles?: unknown;
})=><div css={props.styles}/>;
const ArrayValue = (props: {
    styles?: unknown;
})=><div css={[
        props.styles
    ]}/>;
const ObjectValue = ()=><div css={{
        color: "red"
    }}/>;
