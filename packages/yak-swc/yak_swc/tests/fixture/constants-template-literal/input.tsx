import { styled } from "@yak/react";

const GAP = "20px";
const NEGATIVE_GAP = `-${GAP}`;

export const Pull = styled.div`
  margin-left: ${NEGATIVE_GAP};
`;

const HALF_GAP_SOURCE = 20;
const HALF_NEGATIVE_GAP = `-${HALF_GAP_SOURCE / 2}px`;

export const HalfPull = styled.div`
  margin-left: ${HALF_NEGATIVE_GAP};
`;
