import { css } from "next-yak";

const pad = css`
  padding: 8px;
`;

// Arrays aren't supported
const ArrayValue = () => <div css={[pad]} />;

// Objects aren't supported
const ObjectValue = () => <div css={{ color: "red" }} />;

// Plain values aren't supported
const StringValue = () => <div css={"color: red"} />;
const NumberValue = () => <div css={42} />;
const TemplateValue = () => <div css={`color: red`} />;
const TrueValue = () => <div css={true} />;

// Functions other than css or atoms aren't supported
const FunctionValue = () => <div css={() => pad} />;

// A call which is neither a css template nor atoms() isn't supported
const CallValue = () => <div css={makeStyles()} />;

// Invalid ternary arm is checked and not supported
const TernaryArm = ({ on }: { on: boolean }) => <div css={on ? [pad] : undefined} />;

declare function makeStyles(): any;
