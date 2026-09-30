import { styled, css } from "@yak/react";

export const Card = styled.div`
  background: url("/card-bg.jpg") no-repeat;
  ${({$active}) => $active && css`
    background: url(/card-bg-active.jpg) no-repeat;
  `}
   transform: translate(-50%, -50%) rotate(${({ index }) => index * 30}deg)
      translate(0, -88px) rotate(${({ index }) => -index * 30}deg);
`; 