import { styled, useTheme } from "next-yak";
import { baseStyle } from "./mixins";
import { MyButton } from "./myButton";

interface ButtonProps {
  primary?: boolean;
}

function App() {
  const theme = useTheme();
  console.log({ theme });
  return (
    <Container>
      <Title>YAK + Vite Integration Test</Title>
      <Button primary>Primary Button</Button>
      <Button>Secondary Button</Button>
      <Card>
        <CardTitle>Test Card</CardTitle>
        <CardContent>
          This is a test card to verify that the YAK plugin is working correctly
          with Vite. The styles should be applied and visible.
        </CardContent>
        <Wrapper>
          ete
          <MyButton>TEEST</MyButton>
        </Wrapper>
      </Card>
    </Container>
  );
}

export default App;

const Wrapper = styled.div`
  & ${MyButton} {
    color: red;
  }
  color: blue;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  ${baseStyle};
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const Button = styled.button<ButtonProps>`
  background: ${(props) => (props.primary ? "#3498db" : "#95a5a6")};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.primary ? "#2980b9" : "#7f8c8d")};
    transform: translateY(-1px);
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid #e0e0e0;
`;

const CardTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
`;

const CardContent = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;
