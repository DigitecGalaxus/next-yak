import { css, styled } from "next-yak";

export const Hero = styled.header`
  display: grid;
  gap: 12px;
  text-align: center;
  margin: 24px 0 12px;
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

export const Section = styled.section`
  margin: 24px 0;
`;

export const muted = css`
  color: var(--color-muted-fg);
`;
