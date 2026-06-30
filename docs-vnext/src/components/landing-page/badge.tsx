import { styled } from "next-yak";
import { colors, fonts, fontSize } from "@/tokens";

const Badge = styled.li`
  display: flex;
  padding: 6px 11px 6px 10px;
  align-items: center;
  gap: 7px;
  border: 1.5px solid ${colors.cardBorder};
  border-radius: 8px;
  font-family: ${fonts.mono};
  font-size: ${fontSize.eyebrow};
`;

export default Badge;
