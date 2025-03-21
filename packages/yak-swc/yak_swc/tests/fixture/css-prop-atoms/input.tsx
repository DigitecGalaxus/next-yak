import { styled, atoms } from "next-yak";

const Elem = () => <div css={atoms("mb-8 flex flex-col")} />;

const Elem2 = () => (
  <div css={atoms("mb-8 flex flex-col")} className="test-class" />
);

const Elem3 = () => (
  <div style={{ padding: "5px" }} css={atoms("mb-8 flex flex-col")} />
);

const Elem4 = (props: any) => (
  <div css={atoms("mb-8 flex flex-col")} {...props} />
);

const Elem5 = (props: any) => (
  <div css={atoms("mb-8 flex flex-col")} {...props.a} {...props.b} />
);

const Elem6 = () => (
  <div
    css={atoms("mb-8 flex flex-col")}
    className="main"
    style={{ fontWeight: "bold" }}
  />
);

const Elem7 = () => <div className="no-css" />;

const Elem8 = () => <div css={atoms("")} className="empty-css" />;

const Elem9 = (isSomething: boolean) => (
  <div css={atoms("flex gap-4", isSomething ? "basis-8/12" : "w-full")} />
);

const Text = styled.p`
  font-size: 20px;
`;

const StyledComponentWithCSSProp = () => (
  <Text css={atoms("mb-8 flex flex-col")}>test</Text>
);
