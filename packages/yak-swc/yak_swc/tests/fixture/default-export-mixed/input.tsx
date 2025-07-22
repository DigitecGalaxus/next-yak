import { styled } from "next-yak";

// Named export
export const Button = styled.button`
  background: green;
  padding: 10px;
`;

// Another named export
export const Input = styled.input`
  border: 2px solid blue;
  padding: 5px;
`;

// Default export
const Container = styled.div`
  background: yellow;
  padding: 20px;
`;

export default Container;