import { styled } from "next-yak";
import { ReactNode } from "react";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  & > div > :first-child {
    margin-top: 0;
  }
`;

export const SideBySide = ({ children }: { children: ReactNode }) => {
  return <Grid>{children}</Grid>;
};
