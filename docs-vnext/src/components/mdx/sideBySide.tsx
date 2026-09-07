import { styled } from "next-yak";
import { ReactNode } from "react";
import { container } from "@/tokens";

export const SideBySide = ({ children }: { children: ReactNode }) => {
  return <Grid>{children}</Grid>;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  /* keys off the prose column's width (Content sets container: prose), not the viewport,
     so it stacks in a narrow docs column even on a wide screen */
  @container prose (max-width: ${container.prose.sideBySide}) {
    grid-template-columns: 1fr;
  }

  & > div > :first-child {
    margin-top: 0;
  }
`;
