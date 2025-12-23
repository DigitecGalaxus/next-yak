"use client";
import { ident, keyframes, styled } from "next-yak";
import {
  FC,
  startTransition,
  useEffect,
  useState,
  ViewTransition,
} from "react";

export const color = ident`--color`;
const viewTransitionName = ident`🔥123`;

const splashIn = keyframes`
  from {
        transform: scale(1.2);
        opacity: 0;
        filter: blur(10px);
      }
  `;

const splashOut = keyframes`
  to {
        transform: scale(0.8);
        opacity: 0;
        filter: blur(10px);
      }
  `;

const DemoContainer = styled.div`
  display: grid;
  gap: 20px;
  padding: 40px;
  max-width: 800px;

  /* Disable default root transition */
  html:has(&):global(::view-transition-group(root)) {
    animation: none;
    animation-name: none;
  }

  /* Disable default fade */
  html:has(&):global(::view-transition-image-pair(${viewTransitionName})) {
    animation: none;
    animation-name: none;
  }

  html:has(&):global(::view-transition-old(${viewTransitionName})),
  html:has(&):global(::view-transition-new(${viewTransitionName})) {
    animation-duration: 0.5s;
  }

  html:has(&):global(::view-transition-old(${viewTransitionName})) {
    animation-name: ${splashOut};
  }

  html:has(&):global(::view-transition-new(${viewTransitionName})) {
    animation-name: ${splashIn};
  }
`;

const DashedCard = styled.div<{ $backgroundColor: string }>`
  ${color.name}: black;
  color: ${color};
  background: ${(props) => props.$backgroundColor};
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;

  &[data-light-color="true"] {
    ${color.name}: white;
  }

  h3 {
    margin: 0 0 8px 0;
  }

  code {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
  }
`;

function shouldUseLightText(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if background is dark (needs light text)
  return luminance < 0.5;
}

const Item: FC<{ backgroundColor: string }> = ({ backgroundColor }) => {
  return (
    <ViewTransition name={viewTransitionName.toString()}>
      <DashedCard
        data-light-color={shouldUseLightText(backgroundColor)}
        $backgroundColor={backgroundColor}
      >
        <h3>Ident Demo</h3>
        <p>This is an example of an ident demo.</p>
      </DashedCard>
    </ViewTransition>
  );
};

function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const IdentDemo = () => {
  const [randomColorState, setRandomColor] = useState(randomColor());

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        setRandomColor(randomColor());
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DemoContainer>
      <Item backgroundColor={randomColorState} />
    </DemoContainer>
  );
};
