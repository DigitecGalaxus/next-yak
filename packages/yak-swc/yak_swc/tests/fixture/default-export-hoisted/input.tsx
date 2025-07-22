import { styled } from "next-yak";

// Test hoisted export pattern - export comes before declaration
export default Title;

var Title = styled.h1`
  color: blue;
  font-size: 24px;
`;