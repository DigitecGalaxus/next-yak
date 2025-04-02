import { styled } from "next-yak";

export const Button = styled.button`
  background-color: #007bff;
`;

export const FancyButton = styled(Button)`
  margin-bottom: 23px;
`

export const Button2 = styled.button`
  background-color: #007bfb;
`

export const Button3 = styled("button")`
  background-color: #007bfb;
`