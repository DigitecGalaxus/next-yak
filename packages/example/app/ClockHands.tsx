"use client";
import { css, styled } from "next-yak";
import { useEffect, useMemo, useState } from "react";

export const ClockHands = () => {
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

export const ClockHand = styled.div<{ $angle: number }>`
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

export const maxWidthMixin = css`
  max-width: 300px;
`;
