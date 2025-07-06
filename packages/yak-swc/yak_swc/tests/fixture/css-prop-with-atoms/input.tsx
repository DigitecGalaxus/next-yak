import { css, styled, atoms } from "next-yak";

const Elem = () => <div css={atoms("yellow")} />;

const Elem2 = () => <div css={atoms("blue")} className="test-class" />;

const Elem3 = () => <div style={{ padding: "5px" }} css={atoms("padding")} />;

const Elem4 = (props: any) => <div css={atoms("green")} {...props} />;

const Elem5 = (props: any) => (
  <div css={atoms("purple")} {...props.a} {...props.b} />
);

const Elem6 = () => (
  <div
    css={atoms("font-size")}
    className="main"
    style={{ fontWeight: "bold" }}
  />
);

const Elem7 = () => <div className="no-css" />;

const Elem8 = () => <div css={atoms("empty-css")} className="empty-css" />;

const Text = styled.p`
  font-size: 20px;
`;

const StyledComponentWithCSSProp = () => <Text css={atoms("red")}>test</Text>;

const CssAndAtoms = () => (
  <div
    css={css`
      color: red;
      ${atoms("yellow")}
    `}
    className="test-class"
  />
);
