import { styled } from "@yak/react";

export const ThemedButton = styled.button`
    background-color: var(--primary-color);
    color: #fff;
    font-size: var(--font-size-base);
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: var(--secondary-color);
  }
`;

export const ThemeProvider = styled.div`
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
`;