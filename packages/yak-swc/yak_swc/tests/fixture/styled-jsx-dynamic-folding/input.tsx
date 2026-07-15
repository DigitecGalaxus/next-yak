import { css, styled } from "next-yak";
import { ImportedCard } from "./imported-card";

const props = {} as any;

// folds: the class-toggling expression is inlined at the usage
const IconContainer = styled.span<{ $hasChildren?: boolean }>`
  display: flex;
  min-height: 24px;
  ${({ $hasChildren }) => $hasChildren && css`margin-right: 12px;`}
`;

// folds: ternary mixin plus a second expression
const Many = styled.p<{ $variant?: string; $bold?: boolean }>`
  color: black;
  ${({ $variant }) =>
    $variant === "primary"
      ? css`
          color: red;
        `
      : css`
          color: blue;
        `}
  ${({ $bold }) => $bold && css`font-weight: bold;`}
`;

// folds: zero-arg expressions reference the outer scope like the css prop
const isCompact = true;
const Scoped = styled.em`
  color: green;
  ${() => isCompact && css`line-height: 1;`}
`;

// the twice-referenced $size attribute is read at two sites, so an impure
// value would be evaluated twice - it is bound once instead
const Twice = styled.li<{ $size?: string }>`
  padding: 1px;
  ${({ $size }) => $size && $size === "big" && css`padding: 8px;`}
`;

// folds: one read, inside a callback - an impure value would run once per list
// element, so a single read is enough to bind it
const sizes = [1, 2, 3];
const InCallback = styled.div<{ $n?: number }>`
  ${({ $n }) => sizes.some((x) => x > $n) && css`color: red;`}
`;

// folds: one read, behind a short circuit - an impure value would not run at
// all when the left side is falsy
const ShortCircuit = styled.div<{ $b?: boolean }>`
  ${({ $b }) => isCompact && $b && css`color: blue;`}
`;

// folds: the conditions read $a before $b, the attributes pass $b first - the
// arguments follow the attributes, not the conditions
const Pair = styled.div<{ $a?: unknown; $b?: unknown }>`
  ${({ $a }) => $a && css`color: red;`}
  ${({ $b }) => $b && css`top: 0;`}
`;

// folds: a single condition to pin what counts as safe to inline
const colors = { big: "red" } as Record<string, string>;
const Boxed = styled.div<{ $v?: unknown }>`
  ${({ $v }) => $v && css`color: red;`}
`;

// folds: an arrow returning from a block body is a condition like any other
const BlockBody = styled.aside<{ $wide?: boolean }>`
  padding: 1px;
  ${({ $wide }) => {
    return $wide && css`padding: 8px;`;
  }}
`;

// usages bail: only plain destructuring substitutes - a rename, a default or a
// rest element all keep the runtime path
const Renamed = styled.mark<{ $size?: string }>`
  ${({ $size: size }) => size && size === "big" && css`padding: 8px;`}
`;
const Defaulted = styled.mark<{ $size?: string }>`
  ${({ $size = "big" }) => $size === "big" && css`padding: 8px;`}
`;
const Rested = styled.mark<{ $size?: string }>`
  ${({ $size, ...rest }) => $size && rest && css`padding: 8px;`}
`;

// usages bail: a function expression binds this/arguments, which inlining
// would rebind to the enclosing component
const Fn = styled.i<{ $on?: boolean }>`
  color: gray;
  ${function ({ $on }) {
    return $on && css`color: black;`;
  }}
`;

// folds: non-$ props toggle classes AND stay on the element - the attribute
// value ends up in the DOM attribute and the className condition
const ActionButton = styled.button<{ disabled?: boolean }>`
  color: blue;
  ${({ disabled }) => !disabled && css`cursor: pointer;`}
`;

// usages bail: the runtime injects the theme which is unknown at build time
const Themed = styled.strong<{ $accent?: boolean }>`
  color: black;
  ${({ theme, $accent }) => theme.highContrast && $accent && css`color: red;`}
`;

// usages bail: the mixin carries a css variable set through the style prop
const NestedCssVariable = styled.div<{ $active?: boolean; $size: number }>`
  ${({ $active, $size }) =>
    $active &&
    css`
      width: ${() => $size}px;
    `}
`;

// usages bail: the $prop forwarding semantics depend on the wrapped component
const DynamicExtended = styled(ImportedCard)<{ $active?: boolean }>`
  ${({ $active }) => $active && css`color: red;`}
`;

// usages bail: attrs
const DynamicAttrs = styled.button.attrs({ type: "button" })<{ $active?: boolean }>`
  ${({ $active }) => $active && css`color: red;`}
`;

// usages bail: a namespaced attribute is keyed by its plain name everywhere
// below, so it would evaluate on the element without ever counting as an
// obstacle the parameter block may not jump - `<use xlink:href>` is the
// sprite pattern, and svg/use/image are all foldable elements
const Sprite = styled.use<{ $active?: boolean; $muted?: boolean }>`
  ${({ $active }) => $active && css`color: red;`}
  ${({ $muted }) => $muted && css`opacity: 0.5;`}
`;

// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = styled.div`
  ${({ className }) => className && css`color: red;`}
`;

// usages bail: React strips key before the component sees props, so the
// runtime reads undefined - substituting the attribute value would diverge
const KeyBail = styled.li`
  ${({ key }) => key === "active" && css`color: red;`}
`;

// folds: identifier param with member access - `(p) => p.$x` is the common
// real-world styled-components style
const MemberButton = styled.button<{
  $active?: boolean;
  $fullWidth?: boolean;
  $variant?: "primary" | "secondary" | "ghost";
}>`
  display: inline-flex;
  ${(p) => !p.$active && css`background-color: #d1d5db;`}
  ${(p) => p.$variant === "secondary" && css`background-color: #f3f4f6;`}
  ${(p) => p.$variant === "ghost" && css`background-color: transparent;`}
  ${(p) => p.$fullWidth && css`width: 100%;`}
`;

// usages bail: the whole props object escapes into the function call
const MemberEscape = styled.div<{ $active?: boolean }>`
  ${(p) => props.calculate(p) && css`color: red;`}
`;

// usages bail: theme access through the identifier param
const MemberTheme = styled.div<{ $accent?: boolean }>`
  ${(p) => p.theme.highContrast && p.$accent && css`color: red;`}
`;

// usages bail: computed member access
const MemberComputed = styled.div<{ $active?: boolean }>`
  ${(p) => p["$active"] && css`color: red;`}
`;

// usages bail: key access through the identifier param
const MemberKey = styled.li`
  ${(p) => p.key === "active" && css`color: red;`}
`;

// folds: passing key at a call site never blocks folding - only reading it
// inside a style expression does
const KeyedRow = styled.li<{ $active?: boolean }>`
  ${(p) => p.$active && css`color: red;`}
`;

const Optimizable = ({ active, size, i }: { active?: boolean; size?: string, i: number }) => (
  <>
    <IconContainer aria-hidden $hasChildren>
      <i />
    </IconContainer>
    <IconContainer $hasChildren={active} data-kept="yes" $foreign="dropped">
      inlines the attribute expression and drops all $props
    </IconContainer>
    <IconContainer>absent $props count as undefined</IconContainer>
    <IconContainer $hasChildren className="user">
      static class merge
    </IconContainer>
    <IconContainer $hasChildren className={active && "on"}>
      runtime class merge
    </IconContainer>
    <IconContainer
      $hasChildren
      css={css`
        color: orange;
      `}
    >
      css prop merge
    </IconContainer>
    <Many $variant="primary" $bold>
      two inlined expressions
    </Many>
    <Scoped>outer scope condition</Scoped>
    <Twice $size={size}>safe to duplicate</Twice>
    <ActionButton disabled={active}>kept on the element and inlined</ActionButton>
    <ActionButton disabled>bare non-$ prop</ActionButton>
    {/* two read sites, so the value is bound once instead of rolled twice -
        the two conditions could otherwise disagree */}
    <Twice $size={props.getSize()}>bound: read at two sites</Twice>
    {/* the attribute stays on the element AND feeds the condition, so binding
        it around the element is the only way to evaluate it once - otherwise
        the button could be disabled while it is styled as enabled */}
    <ActionButton disabled={props.isBusy()}>bound: element and condition</ActionButton>
    {/* one read, but inside a callback: the value would run once per list
        element */}
    <InCallback $n={props.roll()}>bound: read inside a callback</InCallback>
    {/* one read, but behind a short circuit: the value would not run at all */}
    <ShortCircuit $b={props.roll()}>bound: read behind a short circuit</ShortCircuit>
    {/* the allowlist is not "does it contain a call" - none of these is one */}
    <Boxed $v={i++}>bound: update expression</Boxed>
    <Boxed $v={new Date()}>bound: new expression</Boxed>
    <Boxed $v={props.getSize() as number}>bound: judged under the type cast</Boxed>
    {/* effect free but identity bearing - two reads would be two elements */}
    <Boxed $v={<i />}>bound: jsx element</Boxed>
    {/* an impure builtin is bound like any other call, and stays in argument
        position: React's own purity rule flags it here exactly as it flags it
        in the source */}
    <Boxed $v={Math.random()}>bound: impure builtin</Boxed>
    {/* inlined: a computed member over pure operands, and a comparison - the
        most common dynamic prop shapes there are */}
    <Boxed $v={colors[size!]}>inlined: computed member</Boxed>
    <Boxed $v={i % 4 !== 0}>inlined: comparison</Boxed>
    {/* the conditions read $a first; the arguments follow the attributes */}
    <Pair $b={props.roll()} $a={props.getSize()}>bound: arguments in attribute order</Pair>
    {/* attribute position ran getSize() twice, so binding does too */}
    <Pair $b={props.getSize()} $a={props.getSize()}>bound: never deduplicated</Pair>
    {/* read by no condition: it never leaves attribute position */}
    <Boxed $v={active} id={props.getSize()}>inlined: unread attribute stays put</Boxed>
    {/* an arrow may move, so an event handler never forces the element-wrap */}
    <Boxed $v={props.roll()} onClick={() => props.track()}>bound: handler may move</Boxed>
    {/* the user className composes around the block, after it - which is where
        it already ran */}
    <Boxed $v={props.roll()} className="user">bound: static className merge</Boxed>
    <Boxed $v={props.roll()} className={size}>bound: runtime className merge</Boxed>
    <MemberButton $active={i % 4 !== 0} $fullWidth={i % 3 === 0} $variant="primary">
      {i}
    </MemberButton>
    <KeyedRow key={i} $active={active}>
      key at the call site still folds
    </KeyedRow>
    <BlockBody $wide={active}>block body arrow</BlockBody>
    {/* getSize() ran between the two rolls, and may not jump the parameter
        block, so the whole element is wrapped and captures all three in
        source order */}
    <Pair $a={props.roll()} id={props.getSize()} $b={props.roll()}>
      wrapped: nothing may jump the block
    </Pair>
    {/* the user className ran BEFORE the roll, and it composes around the
        block, which would run it after - so this escalates too */}
    <Boxed className={props.getSize()} $v={props.roll()}>wrapped: className ran first</Boxed>
    {/* an unread $prop is dropped before the DOM, so its value never runs at
        all - a side effect nobody consumes, which React's purity rule already
        forbids */}
    <Boxed $v={active} $unread={props.track()}>elided: unread $prop</Boxed>
    {/* key and children stay normal JSX on the wrapped element */}
    {sizes.map((it) => (
      <ActionButton key={it} disabled={props.isBusy()}>
        wrapped in a list
      </ActionButton>
    ))}
  </>
);

// folds: await is legal in an async server component and impure, so it is
// bound - which only works because the value never moves out of argument
// position: awaiting inside the synthesized closure would not even parse
const AsyncPage = async () => <Boxed $v={await props.load()}>bound: await stays an argument</Boxed>;

const NotOptimizable = () => (
  <>
    <IconContainer {...props}>bails: spread</IconContainer>
    <Themed $accent>bails: theme access</Themed>
    <NestedCssVariable $active $size={12}>bails: nested css variable</NestedCssVariable>
    <DynamicExtended $active>bails: dynamic wrapped component</DynamicExtended>
    <DynamicAttrs $active>bails: dynamic attrs</DynamicAttrs>
    <ClassNameBail className="user">bails: className access</ClassNameBail>
    <MemberEscape $active>bails: whole props object escapes</MemberEscape>
    <MemberTheme $accent>bails: theme access</MemberTheme>
    <MemberComputed $active>bails: computed member access</MemberComputed>
    <KeyBail key="active">bails: destructured key access</KeyBail>
    <MemberKey key="active">bails: key access</MemberKey>
    <Renamed $size="big">bails: renamed destructuring</Renamed>
    <Defaulted>bails: default value destructuring</Defaulted>
    <Rested $size="big">bails: rest element destructuring</Rested>
    <Fn $on>bails: function expression condition</Fn>
    {/* spriteFor() would jump both rolls: the namespaced name is the only
        difference from the wrapped `id={...}` case above */}
    <Sprite $active={props.roll()} xlink:href={props.getSize()} $muted={props.roll()}>
      bails: namespaced attribute
    </Sprite>
    {/* only the last of a repeated attribute is bound, so the first getSize()
        would be left on the element or dropped with the $prop */}
    <ActionButton disabled={props.isBusy()} disabled={props.roll()}>
      bails: repeated attribute
    </ActionButton>
  </>
);