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

const ElemEntity = () => (
  <div
    css={css`
      color: red;
    `}
    className="Food &amp; Drink"
  />
);

const ElemBackslash = () => (
  <div
    css={css`
      color: red;
    `}
    className="before:content-['\2713']"
  />
);

const ElemEmoji = () => (
  <div
    css={css`
      color: red;
    `}
    className="🔥 mark"
  />
);

const Elem7 = () => <div className="no-css" />;

const Elem8 = () => <div css={css``} className="empty-css" />;

const Elem9 = () => <div css={css``} />;

const Elem10 = ({ on }: { on: boolean }) => (
  <div
    css={css`
      ${() =>
        on
          ? css`
              color: red;
            `
          : css`
              color: blue;
            `}
    `}
  />
);

const Elem11 = ({ on }: { on: boolean }) => (
  <div
    css={
      on
        ? (css`
            color: red;
          ` as any)
        : css`
            color: blue;
          `
    }
  />
);

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
