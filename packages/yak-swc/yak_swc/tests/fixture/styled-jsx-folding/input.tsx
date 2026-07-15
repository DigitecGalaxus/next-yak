import React, { memo } from "react";
import { css, styled } from "next-yak";
import { ImportedCard } from "./imported-card";

const someRef = { current: null } as any;
const props = {} as any;
const mixin = css`
  color: red;
`;

// folds
const Card = styled.div`
  color: red;
`;

// folds: styled("...") string form
const Box = styled("section")`
  color: blue;
`;

// exported: local usages fold, the declaration stays
export const Title = styled.h1`
  font-size: 2rem;
`;

// bails: dynamic css
const Dynamic = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

// bails: attrs
const WithAttrs = styled.button.attrs({ type: "button" })`
  color: green;
`;

// folds to the wrapped component: <Extended> becomes <Card className="...">
const Extended = styled(Card)`
  color: yellow;
`;

// folds although the wrapped component comes from another file
const ExtendedImport = styled(ImportedCard)`
  color: silver;
`;

// bails: a lowercase name would be parsed as an intrinsic element in JSX
const lowercaseComponent = (p: any) => <i {...p} />;
const ExtendedLowercase = styled(lowercaseComponent)`
  color: gold;
`;

// bails: the wrapped component binding can be reassigned
let MutableTarget = (p: any) => <b {...p} />;
const ExtendedMutable = styled(MutableTarget)`
  color: ivory;
`;

// bails: let declaration
let Mutable = styled.div`
  color: pink;
`;

// bails: var redeclaration - both declarations share a single binding
var Redeclared = styled.div`
  color: peru;
`;
var Redeclared = styled.span`
  color: plum;
`;

// folds although the declaration comes after the usage
const Early = () => <Late>before declaration</Late>;
const Late = styled.p`
  color: gray;
`;

// bails: wrapped in an HOC - folding would drop the wrapper
const Memoized = memo(styled.div`
  color: teal;
`);

// folds: type casts are unwrapped
const Cast = styled.div`
  color: brown;
` as unknown as typeof Card;

const BoxWithMixin = styled.div`
  background: white;
  ${mixin};
`;

const Optimizable = ({ active }: { active?: boolean }) => (
  <>
    <Card>folds</Card>
    <Card style={{ margin: 1 }} onClick={() => {}} ref={someRef} data-x="1">
      forwards attributes
    </Card>
    <Card className="user">static class name merge</Card>
    <Card className={active && "active"}>runtime class name merge</Card>
    <Card $foo="forwarded">$props are not filtered</Card>
    <Card
      css={css`
        color: orange;
      `}
    >
      css prop merge
    </Card>
    <Card>
      <Box />
    </Card>
    <Title>folds</Title>
    <Cast>folds through the type cast</Cast>
    <Extended>folds to the wrapped component</Extended>
    <Extended className="user">merges into the wrapped component</Extended>
    <ExtendedImport>folds to the imported component</ExtendedImport>
    <BoxWithMixin>folds with mixin</BoxWithMixin>
  </>
);

// bails: wrapped in React.memo - the HOC result must not fold to a bare DOM element
const ReactMemoized = React.memo(styled.div`
  color: olive;
`);

// bails: conditional initializer - the branch is only known at runtime
const Conditional = props.flag
  ? styled.a`
      color: crimson;
    `
  : styled.button`
      color: navy;
    `;

const NotOptimizable = () => (
  <>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <ExtendedLowercase>bails: lowercase wrapped component</ExtendedLowercase>
    <ExtendedMutable>bails: reassignable wrapped component</ExtendedMutable>
    <Mutable>bails</Mutable>
    <Redeclared>bails: var redeclaration</Redeclared>
    <Memoized>bails: HOC wrapper</Memoized>
    <ReactMemoized>bails: HOC wrapper</ReactMemoized>
    <Conditional>bails: conditional initializer</Conditional></>
);

const Shadowed = () => {
  const Card = (p: any) => <span {...p} />;
  return <Card>bails: shadowed local</Card>;
};
