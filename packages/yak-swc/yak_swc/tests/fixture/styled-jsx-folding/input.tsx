import { css, styled } from "next-yak";

const someRef = { current: null } as any;
const props = {} as any;

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

// bails: styled(Component)
const Extended = styled(Card)`
  color: yellow;
`;

// bails: let declaration
let Mutable = styled.div`
  color: pink;
`;

// folds although the declaration comes after the usage
const Early = () => <Late>before declaration</Late>;
const Late = styled.p`
  color: gray;
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
  </>
);

const NotOptimizable = () => (
  <>
    <Card {...props}>bails: spread</Card>
    <Card theme={props.theme}>bails: theme</Card>
    <Card<any>>bails: type arguments</Card>
    <Dynamic $color="red">bails</Dynamic>
    <WithAttrs>bails</WithAttrs>
    <Extended>bails</Extended>
    <Mutable>bails</Mutable></>
);

const Shadowed = () => {
  const Card = (p: any) => <span {...p} />;
  return <Card>bails: shadowed local</Card>;
};
