import { light, dark } from "@/tokens";
import { styled } from "next-yak";

export const Steps = styled.ol`
  counter-reset: step;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
  list-style: none;

  /* && outranks the prose \`ol\` padding */
  && {
    padding-left: 0;
  }
`;

export const Step = styled.li`
  counter-increment: step;

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
    background: light-dark(${light.red}, ${dark.redDeep});
    color: #fff;
    font-size: 13px;
    font-weight: 700;
  }
`;
