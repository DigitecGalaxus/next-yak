"use client";
import { use, useEffect, useState } from "react";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { highlighterPromise } from "@/lib/shiki";
import { useTheme } from "next-themes";
import "shiki-magic-move/dist/style.css";
import { styled } from "next-yak";
import { breakpoints, colors, theme } from "@/lib/utils/constants";

// Define the structure for code examples
type CodeExample = {
  tsxInput: string;
  compiledJs: string;
  compiledCss: string;
};

const initialCodeExample: CodeExample = {
  tsxInput: `import styled from "styled-components";

const Title = styled.h1\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover {
    color: red;
  }
\`;

const App = () => (
  <Title>
    Hello World
  </Title>
);`,
  compiledJs: `// JS output (auto-generated)

const Title = styled.h1.withConfig({
  componentId: "sc-1289dod-0"
})\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover {
    color: red;
  }
\`;

const App = () => (
  <Title>
    Hello World
  </Title>
);`,
  compiledCss: "/* no static css */",
};

const finalCodeExample: CodeExample = {
  tsxInput: `// change import to next-yak
import { styled } from "next-yak";

const Title = styled.h1\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover {
    color: red;
  }
\`;

const App = () => (
  <Title>
    Hello World
  </Title>
);`,
  compiledJs: `// JS output (auto-generated)

const Title = styled('h1',
  "Title-1289do1");

const App = () => (
  <Title>
    Hello World
  </Title>
);`,
  compiledCss: `/* CSS output (auto-generated) */

.Title-1289do1 {
  font-size: 1.5em;
  color: palevioletred;
  &:hover {
    color: red;
  }
}`,
};

const codeExamples: Array<CodeExample> = [
  // Initial state
  initialCodeExample,
  // Step 1: Add comment
  {
    ...initialCodeExample,
    tsxInput: `// change import to next-yak
${initialCodeExample.tsxInput}`,
  },
  // Step 2: Change import
  {
    ...initialCodeExample,
    tsxInput: finalCodeExample.tsxInput,
  },
  // Step 3: Update JS output
  {
    ...finalCodeExample,
    compiledCss: initialCodeExample.compiledCss,
  },
  // Step 4: Update CSS comment
  {
    ...finalCodeExample,
    compiledCss: "/* CSS output (auto-generated) */",
  },
  // Step 5: Update CSS output
  finalCodeExample,
  // Step 6: Keep yak for another "frame"
  finalCodeExample,
  // Step 7: Empty
  {
    tsxInput: "",
    compiledJs: "",
    compiledCss: "",
  },
  // Step 7: Go back to initial state
  initialCodeExample,
];

export const AnimatedCode = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const highlighter = use(highlighterPromise);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (playing) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % codeExamples.length);
      }, 3000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [playing]);

  // don't use any theme on SSR
  let shikiTheme = "none";
  if (mounted) {
    shikiTheme = theme === "dark" ? "vitesse-dark" : "vitesse-light";
  }

  const currentCode = codeExamples[currentStep];

  return (
    <ResponsiveCode>
      <AnimationWrapper>
        <CodeWrapper>
          <ShikiMagicMove
            key={`${shikiTheme}-input`}
            lang="tsx"
            theme={shikiTheme}
            highlighter={highlighter}
            code={currentCode.tsxInput}
            options={{ duration: 800, stagger: 1, lineNumbers: false }}
          />
          <OutputWrapper>
            <ShikiMagicMove
              key={`${shikiTheme}-output`}
              lang="tsx"
              theme={shikiTheme}
              highlighter={highlighter}
              code={currentCode.compiledJs}
              options={{ duration: 800, stagger: 1, lineNumbers: false }}
            />
            <ShikiMagicMove
              key={`${shikiTheme}-css`}
              lang="css"
              theme={shikiTheme}
              highlighter={highlighter}
              code={currentCode.compiledCss}
              options={{ duration: 800, stagger: 1, lineNumbers: false }}
            />
          </OutputWrapper>
        </CodeWrapper>
        <AnimationButton onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="14" y="4" width="4" height="16" rx="1" />
              <rect x="6" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </AnimationButton>
      </AnimationWrapper>
      <video
        src="https://github.com/DigitecGalaxus/next-yak/assets/4113649/f5a220fc-2a0f-46be-a8e7-c855f7faa337"
        controls
      />
    </ResponsiveCode>
  );
};

// Styled components remain the same
const CodeWrapper = styled.div`
  display: grid;
  grid-autoflow: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 15px;
  overflow: hidden;
  grid-template-columns: 1fr 1fr;
  ${colors.secondaryStatic};

  background: #fff;
  ${theme.dark} {
    background: rgb(18, 18, 18);
  }
`;

const OutputWrapper = styled.div`
  display: grid;
  gap: 1rem;
  grid-auto-flow: row;
  grid-template-rows: 2fr 1fr;
  width: 100%;
  min-height: 700px;
`;

const AnimationWrapper = styled.div`
  position: relative;
`;

const AnimationButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.5rem 0.5rem;
  cursor: pointer;
  ${colors.secondary};
  border-radius: 50%;
`;

const ResponsiveCode = styled.div`
  font-size: 0.9rem;
  & ${AnimationWrapper} {
    display: none;
  }

  ${breakpoints.md} {
    & ${AnimationWrapper} {
      display: block;
    }
    & video {
      display: none;
    }
  }
`;
