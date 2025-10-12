import { styled } from "next-yak";
import { n } from "./test.yak";

export const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: ${n}px;
  cursor: pointer;
`;
