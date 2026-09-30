import { styled } from "@yak/react";

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
`;

export const PrimaryButton = styled(BaseButton)`
  background-color: #007bff;
  color: #fff;
  &:hover {
    background-color: #0056b3;
  }
`;

export const SecondaryButton = styled(BaseButton)`
  background-color: #6c757d;
  color: #fff;
  &:hover {
    background-color: #545b62;
  }
`;
