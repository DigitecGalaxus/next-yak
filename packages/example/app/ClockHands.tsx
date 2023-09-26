"use client";
import { styled } from "next-yak";
import { useEffect, useState, useMemo, ReactNode } from "react";

export const ClockHands = () => {
  const currentTime = useCurrentTime();
  if (currentTime === null) return null;
  return (
          <>
            <SecondHand angle={currentTime.secondsAngle} />
            <MinuteHand angle={currentTime.minutesAngle} />
            <HourHand angle={currentTime.hoursAngle} />
          </>
        )
};

const useCurrentTime = () => {
  const [time, setTime] = useState<Date | undefined>();
  useEffect(() => {
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

const ClockHand = styled.div<{ angle: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  transform: translate(-50%, -100%) rotate(${({ angle }) => `${angle}deg`});
`;
const SecondHand = styled(ClockHand)`
  width: 2px;
  height: 45%;
  background: red;
`;
const MinuteHand = styled(ClockHand)`
  width: 4px;
  height: 40%;
  background: black;
`;
const HourHand = styled(ClockHand)`
  width: 6px;
  height: 30%;
  background: black;
`;
