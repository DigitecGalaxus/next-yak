import { styled } from "next-yak";
import { colors } from "@/tokens";

// The full-height, centered single-column layout shared by the 404 page and the
// Playground "coming soon" page: a stack of eyebrow/heading/copy with a row of CTAs.
export const MessagePage = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: calc(100vh - 72px);
  padding: 48px 24px 96px;
  text-align: center;
  color: ${colors.violetLight};
`;

export const MessageActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 16px;
`;
