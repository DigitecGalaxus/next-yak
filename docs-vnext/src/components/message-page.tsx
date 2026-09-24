import { styled } from "next-yak";
import { light, dark } from "@/tokens";

export const MessagePage = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 0 auto;
  gap: 12px;
  padding: 48px 24px 96px;
  text-align: center;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

export const MessageActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 16px;
`;
