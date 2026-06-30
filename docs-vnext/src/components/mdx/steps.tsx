import { colors } from "@/tokens";
import { styled } from "next-yak";

export const Steps = styled.ol`
  counter-reset: step;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
  list-style: none;

  /* Beat Prose's \`ol { padding-left: 22px }\` (via && specificity) so the number badges
     align with the heading instead of being indented. */
  && {
    padding-left: 0;
  }
`;

export const Step = styled.li`
  counter-increment: step;

  /* Heading as a flex row so the number badge sits inline with the title; the body stays
     flush-left with the surrounding page text. */
  & > :first-child {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 0;
  }

  & > :first-child::before {
    content: counter(step);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: ${colors.red};
    color: ${colors.onInk};
    font-size: 13px;
    font-weight: 700;
  }
`;
