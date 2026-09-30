import { styled, css } from "@yak/react";

export const FlexContainer = styled.div`
  display: flex;
  align-items: ${({ $align }) => $align || 'stretch'};
  flex-direction: ${({ $direction }) => $direction || 'row'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  padding: 20px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'}px;
  top: ${({ $top }) => $top * 20}%;
  background-color: #f0f0f0;
  ${({ $bottom }) => css`bottom:${$bottom * 20}%`};
`;
