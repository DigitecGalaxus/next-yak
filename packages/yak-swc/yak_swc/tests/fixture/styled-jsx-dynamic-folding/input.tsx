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

// folds: function expression form with a block body
const Fn = styled.i<{ $on?: boolean }>`
  color: gray;
  ${function ({ $on }) {
    return $on && css`color: black;`;
  }}
`;

// folds: zero-arg expressions reference the outer scope like the css prop
const isCompact = true;
const Scoped = styled.em`
  color: green;
  ${() => isCompact && css`line-height: 1;`}
`;

// usages fold only when the twice-referenced $size attribute is safe to duplicate
const Twice = styled.li<{ $size?: string }>`
  padding: 1px;
  ${({ $size }) => $size && $size === "big" && css`padding: 8px;`}
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

// usages bail: the runtime passes more than the attributes to the expressions
const ClassNameBail = styled.div`
  ${({ className }) => className && css`color: red;`}
`;

const Optimizable = ({ active, size }: { active?: boolean; size?: string }) => (
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
    <Fn $on={active}>function form</Fn>
    <Scoped>outer scope condition</Scoped>
    <Twice $size={size}>safe to duplicate</Twice>
    <ActionButton disabled={active}>kept on the element and inlined</ActionButton>
    <ActionButton disabled>bare non-$ prop</ActionButton>
  </>
);

const NotOptimizable = () => (
  <>
    <IconContainer {...props}>bails: spread</IconContainer>
    <Twice $size={props.getSize()}>bails: unsafe to duplicate</Twice>
    <Themed $accent>bails: theme access</Themed>
    <NestedCssVariable $active $size={12}>bails: nested css variable</NestedCssVariable>
    <DynamicExtended $active>bails: dynamic wrapped component</DynamicExtended>
    <DynamicAttrs $active>bails: dynamic attrs</DynamicAttrs>
    <ClassNameBail className="user">bails: className access</ClassNameBail>
    <ActionButton disabled={props.isBusy()}>
      bails: the kept attribute would evaluate a second time in the className
    </ActionButton>
  </>
);
