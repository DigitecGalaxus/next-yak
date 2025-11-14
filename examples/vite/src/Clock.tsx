import { styled } from "next-yak";
import type { ReactNode } from "react";
import { ClockHands } from "./ClockHands";

export const Clock = () => {
  return (
    <ClockWrapper>
      <ClockFace>
        <ClockCenter />
        {Array.from({ length: 12 }).map((_, i) => (
          <ClockNumber key={i} index={i}>
            {(i + 12) % 12 || 12}
          </ClockNumber>
        ))}
        <ClockHands />
      </ClockFace>
    </ClockWrapper>
  );
};

const ClockWrapper = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  margin: 10px auto;
  perspective: 1000px;
`;
const ClockFace = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 2s ease-in-out;
  &:hover {
    transform: rotateX(55deg);
  }
`;
const ClockCenter = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: black;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  translate: 0 0 40px;
`;
const ClockNumber = styled.div<{ index: number; children: ReactNode }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  color: black;
  font-size: 14px;
  text-align: center;
  width: 20px;
  transform: translate(-50%, -50%) rotate(${({ index }) => index * 30}deg)
    translate(0, -88px) rotate(${({ index }) => -index * 30}deg);
`;
