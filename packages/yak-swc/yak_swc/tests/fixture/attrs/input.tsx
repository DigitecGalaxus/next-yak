import { styled } from "@yak/react";

export const Button = styled.button.attrs({ type: "button" })`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background-color: #0056b3;
  }
`;
