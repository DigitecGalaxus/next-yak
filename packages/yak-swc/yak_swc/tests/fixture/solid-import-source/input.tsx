import { styled, css } from "@yak/solid";

export const Button = styled.button`
  color: red;
`;

export const FlexContainer = styled.div<{ $spacing: number; $align?: string }>`
  display: flex;
  align-items: ${({ $align }) => $align || "stretch"};
  margin-bottom: ${({ $spacing }) => $spacing * 8}px;
`;

export const Elem = () => (
  <div
    class="test-class"
    style={{ padding: "5px" }}
    css={css`
      color: blue;
    `}
  />
);
