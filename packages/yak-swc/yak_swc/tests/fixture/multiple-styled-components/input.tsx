import { styled } from "next-yak";

export const Button = styled.button`
  background-color: #007bff;
`;


export const Button2 = styled.button`
  background-color: #11c817;
`;

export const FancyButton = styled(Button)`
  margin-bottom: 23px;
`

export const FancyButton2 = styled(Button2)`
  margin-bottom: 17px;
`
