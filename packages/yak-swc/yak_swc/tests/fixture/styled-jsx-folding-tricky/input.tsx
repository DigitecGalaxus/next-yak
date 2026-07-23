import { css, styled } from "next-yak";

const on = Math.random() > 0.5;
const props = {} as any;
const cn = (value: unknown) => String(value);
const x = {};
const f = () => Math.random() > 0.5;
const g = () => "id-value";

// dynamic component: a class-toggling $prop drives the conditional class
const Toggle = styled.button<{ $on?: boolean }>`
  color: black;
  ${({ $on }) =>
    $on &&
    css`
      color: red;
    `}
`;

// dynamic component reading two $props, to place an impure obstacle between the
// bound props
const Range = styled.span<{ $a?: boolean; $b?: boolean }>`
  ${({ $a }) =>
    $a &&
    css`
      color: red;
    `}
  ${({ $b }) =>
    $b &&
    css`
      color: blue;
    `}
`;

// dynamic component whose condition reads a non-$ prop that also stays on the
// DOM element
const ActionButton = styled.button<{ disabled?: boolean }>`
  ${({ disabled }) =>
    !disabled &&
    css`
      cursor: pointer;
    `}
`;

// static component for the plain className merges
const Card = styled.div`
  color: green;
`;

// styled(Component) wrapper folds to the wrapped component
const Fancy = styled(Card)`
  padding: 4px;
`;

// bails: an .attrs() chain is never registered as foldable
const WithAttrs = styled.input.attrs({ type: "text" })`
  color: blue;
`;

// bails: a let binding can be reassigned, so its usages keep the runtime path
let Mutable = styled.span`
  color: teal;
`;

const Cases = () => (
  <>
    {/* boolean shorthand $prop resolves to true */}
    <Toggle $on>shorthand</Toggle>

    {/* $prop bound from an impure value: ClassNameIife, only the class sees it */}
    <Toggle $on={f()}>bound transient prop</Toggle>

    {/* an impure attr after the only bound $prop sits outside the class slot
        span, so the cheap ClassNameIife shape holds */}
    <Toggle $on={f()} id={g()}>
      obstacle outside the span stays cheap
    </Toggle>

    {/* an impure attr between two bound $props cannot be jumped: element wrap */}
    <Range $a={f()} id={g()} $b={f()}>
      obstacle between props forces the wrap
    </Range>

    {/* a bound non-$ prop stays on the element and reaches the class: element wrap */}
    <ActionButton disabled={f()}>disabled forces the wrap</ActionButton>

    {/* runtime className value merges with the dynamic class via mergeClassNames */}
    <Toggle $on={on} className={cn(x)}>
      runtime className merge
    </Toggle>

    {/* a className that ran before the bound prop wraps the element */}
    <Toggle className={cn(x)} $on={f()}>
      className composes before the prop
    </Toggle>

    {/* static component: a string className merges at compile time */}
    <Card className="user">static merge</Card>

    {/* styled(Component) usage folds to Card with the merged class */}
    <Fancy className="extra">wrapper fold</Fancy>

    {/* bails: a spread after className may carry className/style at runtime */}
    <Card className="x" {...props}>
      spread bail
    </Card>

    {/* bails: theme is deleted before the DOM */}
    <Card theme={props.theme}>theme bail</Card>

    {/* bails: attrs component keeps its wrapper */}
    <WithAttrs>attrs bail</WithAttrs>

    {/* bails: reassignable binding keeps its wrapper */}
    <Mutable>let bail</Mutable>
  </>
);
