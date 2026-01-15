"use client";
import { css, styled } from "next-yak";
import { ReactNode, useEffect, useMemo, useState } from "react";

export const Clock = () => {
  return (
    <ClockWrapper>
      <ClockFace>
        <ClockCenter />
        {Array.from({ length: 12 }).map((_, i) => (
          <ClockNumber key={i} $index={i}>
            {(i + 12) % 12 || 12}
          </ClockNumber>
        ))}
        <ClockHands />
      </ClockFace>
    </ClockWrapper>
  );
};

const ClockHands = () => {
  const currentTime = useCurrentTime();
  if (currentTime === null) return null;
  return (
    <>
      <SecondHand $angle={currentTime.secondsAngle} />
      <MinuteHand $angle={currentTime.minutesAngle} />
      <HourHand $angle={currentTime.hoursAngle} />
    </>
  );
};

const useCurrentTime = () => {
  const [time, setTime] = useState<Date | undefined>();
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return useMemo(() => {
    if (!time) return null;
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();
    return {
      seconds,
      minutes,
      hours,
      secondsAngle: seconds * 6,
      minutesAngle: minutes * 6 + seconds * 0.1,
      hoursAngle: hours * 30 + minutes * 0.5,
    };
  }, [time]);
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
  border: 2px solid #333;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 2s ease-in-out;
  background: #fff;
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

const ClockNumber = styled.div<{ $index: number; children: ReactNode }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  color: black;
  font-size: 14px;
  text-align: center;
  width: 20px;
  transform: translate(-50%, -50%) rotate(${({ $index }) => $index * 30}deg)
    translate(0, -88px) rotate(${({ $index }) => -$index * 30}deg);
`;

const ClockHand = styled.div<{ $angle: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  transform: translate(-50%, -100%) rotate(${({ $angle }) => $angle}deg);
`;

const SecondHand = styled(ClockHand)`
  width: 2px;
  height: 45%;
  translate: 0 0 40px;
  ${({ theme }) =>
    theme.highContrast
      ? css`
          background: #000;
        `
      : css`
          background: #f00;
        `};
`;

const MinuteHand = styled(ClockHand)`
  width: 4px;
  height: 40%;
  background: black;
  translate: 0 0 40px;
`;

const HourHand = styled(ClockHand)`
  width: 6px;
  height: 30%;
  background: black;
  translate: 0 0 40px;
`;
