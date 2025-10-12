import { styled } from "next-yak";
import { Button } from "../../components/button";

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: red;
`;

const ButtonWrapper = styled.div`
  ${Button} {
    color: yellow;
  }
`;

export default function Home() {
  return (
    <>
      <Title>Welcome to Next.js!</Title>

      <ButtonWrapper>
        <Button>Click me</Button>
      </ButtonWrapper>
    </>
  );
}
