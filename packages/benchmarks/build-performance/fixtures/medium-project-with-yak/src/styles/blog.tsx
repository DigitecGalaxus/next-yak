import { styled } from "next-yak";
import { semantic } from "./tokens.yak";

export const List = styled.div`
  display: grid;
  gap: 12px;
`;

export const Item = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  @media (prefers-color-scheme: dark) {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
`;

export const Post = styled.div`
  display: grid;
  gap: 8px;
  max-width: 70ch;
`;

export const Meta = styled.span`
  font-size: 12px;
  color: ${semantic.light.mutedFg};

  @media (prefers-color-scheme: dark) {
    color: ${semantic.dark.mutedFg};
  }
`;
