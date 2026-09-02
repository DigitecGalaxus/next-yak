import { css } from "next-yak";

// A real yak style keeps the module recognized as using next-yak, so the css
// prop below is still processed by the plugin.
const yakClass = css`
  color: blue;
`;

// A css prop next-yak owns is still compiled and merged with className and
// style. Non-strict only changes what happens to a value it can not compile.
const Merged = () => (
  <div
    css={css`
      color: red;
    `}
    className="theirs"
    style={{ padding: "5px" }}
  />
);

// With strictCssProp off, a css prop value next-yak can't handle is left
// untouched instead of failing the build - useful when another library on the
// same element owns the css prop. Under the default strict mode these error
// (see the css-prop-invalid fixture).
const StringValue = () => <div css="their-class" />;
const Reference = (props: { styles?: unknown }) => <div css={props.styles} />;
const ArrayValue = (props: { styles?: unknown }) => <div css={[props.styles]} />;
const ObjectValue = () => <div css={{ color: "red" }} />;
