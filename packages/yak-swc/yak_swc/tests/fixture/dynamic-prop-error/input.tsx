import { styled } from "@yak/react";

export const FlexContainer = styled.div`
  display: flex;
  z-index: ${getZIndex()};
  margin-bottom: ${spacing[40].toString()}px;
`;
