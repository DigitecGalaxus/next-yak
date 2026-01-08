import { styled } from "next-yak";

export const Button = styled.button`
  color: red;
  padding: 8px 16px;
  border: 1px solid currentColor;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
`;

export const FancyButton = styled(Button)`
  color: #48d448;
  border-width: 2px;
`;

export const IconButton = styled(Button)`
  color: magenta;
  border-style: dashed;
`;
