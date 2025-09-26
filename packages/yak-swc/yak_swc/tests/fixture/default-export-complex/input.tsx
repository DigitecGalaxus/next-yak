import { styled } from "next-yak";

const Button = styled.button`
  background: red;
`;

const Title = styled.h1`
  color: blue;
  font-size: 24px;
`;

const Container = styled.div`
  padding: 20px;
  background: yellow;
`;

// Only Container is default exported
export default Container;

// Button is named exported
export { Button };