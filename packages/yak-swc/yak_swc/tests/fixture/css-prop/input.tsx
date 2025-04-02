import { css, styled } from "next-yak";

const Elem = () => (
  <div
    css={css`
      color: red;
    `}
  />
);

const Elem2 = () => (
  <div
    css={css`
      color: blue;
    `}
    className="test-class"
  />
);

const Elem3 = () => (
  <div
    style={{ padding: "5px" }}
    css={css`
      padding: 10px;
    `}
  />
);

const Elem4 = (props: any) => (
  <div
    css={css`
      color: green;
    `}
    {...props}
  />
);

const Elem5 = (props: any) => (
  <div
    css={css`
      color: purple;
    `}
    {...props.a}
    {...props.b}
  />
);

const Elem6 = () => (
  <div
    css={css`
      font-size: 16px;
    `}
    className="main"
    style={{ fontWeight: "bold" }}
  />
);

const Elem7 = () => <div className="no-css" />;

const Elem8 = () => <div css={css``} className="empty-css" />;

const Text = styled.p`
  font-size: 20px;
`;

const StyledComponentWithCSSProp = () => (
  <Text
    css={css`
      color: red;
    `}
  >
    test
  </Text>
);
