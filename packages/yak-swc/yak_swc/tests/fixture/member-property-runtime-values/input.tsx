import { styled, css } from "next-yak";

const SIZES: Record<"sm" | "md", { width: string; height: string }> = {
     sm: { width: '24px', height: '24px' },
     md: { width: '32px', height: '32px' },
   };

const StyledDiv = styled.div<{ $size: "sm" | "md" }>`
  width: ${({ $size }) => SIZES[$size].width};
  height: ${SIZES.sm.height};
`;

const StyledButton = styled.button<{ $active: boolean, $size: "sm" | "md" }>`
  ${({ $active }) => $active && css`
    width: ${({ $size }) => SIZES[$size].width};
    height: ${SIZES.md.height};
  `}
`;