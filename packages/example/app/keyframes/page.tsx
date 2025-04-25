import { styled, keyframes } from "next-yak";
import styles from "../page.module.css";
import { Clock } from "../Clock";
import { ClockHand } from "../ClockHands";
import { verySlow } from "./durationStar";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
  `;

const Headline = styled.h1`
  animation: ${rotate} ${verySlow} linear infinite;
`;

const colorRotation = keyframes`
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
`;

const MyWrapper = styled.div`
  ${ClockHand} {
    background: #ffb134;
    animation: ${colorRotation} ${verySlow} linear infinite;
  }
`;

export default function Home() {
  return (
    <main className={styles.main}>
      <Headline>Hello world</Headline>
      <MyWrapper>
        <Clock />
      </MyWrapper>
    </main>
  );
}
