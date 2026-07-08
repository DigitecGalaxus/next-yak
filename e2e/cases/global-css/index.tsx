import { globalCss, keyframes, styled } from "next-yak";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Consumes a CSS custom property declared in globalCss on :root
const WidthConsumer = styled.div`
  width: var(--global-css-width);
  height: 10px;
`;

// Target for a keyframe animation applied from a global rule
const AnimatedBox = styled.div`
  height: 10px;
`;

// Reacts to :has() in a global rule targeting the component selector
const OpenTrigger = styled.div`
  height: 10px;
`;

// Loses to the global `input:focus-visible` rule below while focused:
// globals are unlayered, so the more specific selector (0-1-1 vs 0-1-0) wins.
const FocusInput = styled.input`
  color: rgb(0, 0, 0);
`;

// Wins over the global rule inside the user-authored @layer below: unlayered
// component styles always beat layered globals, even at equal specificity.
const LayerBox = styled.div`
  color: rgb(0, 128, 0);
`;

globalCss`
  /* 1. plain element selector */
  body {
    background-color: rgb(1, 2, 3);
  }

  /* 2. custom property consumed by a component via var() */
  :root {
    --global-css-width: 123px;
  }

  /* 3. keyframe interpolation applied to a component selector */
  ${AnimatedBox} {
    animation: ${fadeIn} 1s linear;
  }

  /* 4. :has() reacting to a yak component — impossible from a plain .css file */
  body:has(${OpenTrigger}[data-open="true"]) {
    overflow: hidden;
  }

  /* 5. globals are unlayered: this state-scoped rule beats the component's
        plain color via regular specificity, like any global stylesheet would */
  input:focus-visible {
    color: rgb(255, 165, 0);
  }

  /* 6. @layer is opt-in by authoring it: layered globals lose to (unlayered)
        component styles regardless of specificity or source order */
  @layer base {
    ${LayerBox} {
      color: rgb(255, 0, 0);
    }
  }

  /* 7. :global() escape hatch for markup we don't own — the class must not be
        hashed. css-loader unwraps it on webpack, yak unwraps it for native CSS,
        so the same source applies on every bundler */
  :global(.third-party-widget) {
    color: rgb(0, 0, 255);
  }
`;

export default function App() {
  return (
    <div>
      <WidthConsumer data-testid="width-consumer" />
      <AnimatedBox data-testid="animated-box" />
      <OpenTrigger data-open="true" data-testid="open-trigger" />
      <FocusInput data-testid="focus-input" />
      <LayerBox data-testid="layer-box">authored layer loses to component</LayerBox>
      {/* plain DOM class (not a yak component) styled via the :global() escape hatch */}
      <div className="third-party-widget" data-testid="third-party-widget">
        third party markup
      </div>
    </div>
  );
}
