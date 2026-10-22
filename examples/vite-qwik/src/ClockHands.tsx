import { component$, useSignal, useVisibleTask$ } from "@qwik.dev/core";
import { css, styled } from "@yak/qwik";

export const ClockHands = component$(() => {
  const time = useSignal(new Date());
  // ticks on the client only, once the hands are visible
  useVisibleTask$(({ cleanup }) => {
    const interval = setInterval(() => (time.value = new Date()), 1000);
    cleanup(() => clearInterval(interval));
  });
  const seconds = time.value.getSeconds();
  const minutes = time.value.getMinutes();
  const hours = time.value.getHours();
  return (
    <>
      <SecondHand $angle={seconds * 6} />
      <MinuteHand $angle={minutes * 6 + seconds * 0.1} />
      <HourHand $angle={hours * 30 + minutes * 0.5} />
    </>
  );
});

export const ClockHand = styled.div<{ $angle: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 50% 100%;
  transform: translate(-50%, -100%) rotate(${(props) => props.$angle}deg);
`;

const SecondHand = styled(ClockHand)`
  width: 2px;
  height: 45%;
  translate: 0 0 40px;
  ${(props) =>
    props.theme.highContrast
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
