import { styled } from "next-yak";
import { light, dark } from "@/tokens";

// The centered single-column layout shared by the 404 page and the Playground
// "coming soon" page: a stack of eyebrow/heading/copy with a row of CTAs. Both pages sit
// in a PageFrame, which holds the window height, so this fills what the footer leaves.
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
