import { styled } from "next-yak";

const Card = styled.div`
  color: red;
`;

// With foldStatic off, JSX usages keep the runtime wrapper component instead of
// folding into a plain DOM element with a className.
const App = () => (
  <>
    <Card>runtime wrapper</Card>
    <Card className="user">runtime wrapper with className</Card>
  </>
);
