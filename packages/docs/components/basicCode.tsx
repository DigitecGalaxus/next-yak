"use client";
import { highlighterPromise } from "@/lib/shiki";
import { colors, theme } from "@/lib/utils/constants";
import { useTheme } from "next-themes";
import { styled } from "next-yak";
import { use } from "react";
import "shiki-magic-move/dist/style.css";
import { ShikiMagicMove } from "shiki-magic-move/react";

// Define the structure for code examples
type CodeExample = {
  tsxInput: string;
};

const initialCodeExample: CodeExample = {
  tsxInput: `import { styled, css } from "next-yak";

export const Title = styled.button<{ $primary }>\`
  font-size: 1.5em;
  color: palevioletred;
  &:hover {
    color: red;
  }
  \${({ $primary }) => $primary && css\`
    background: blue;
    color: white;
  \`}
\`;`,
};

export const BasicCode = () => {
  const highlighter = use(highlighterPromise);
  const { theme: currentTheme } = useTheme();

  // Use the appropriate theme based on the current theme
  const shikiTheme = currentTheme === "dark" ? "vitesse-dark" : "vitesse-light";

  return (
    <ResponsiveCode key={shikiTheme}>
      <CodeWrapper>
        <ShikiMagicMove
          lang="tsx"
          theme={shikiTheme}
          highlighter={highlighter}
          code={initialCodeExample.tsxInput}
          options={{ lineNumbers: false }}
        />
      </CodeWrapper>
    </ResponsiveCode>
  );
};

// Styled components
const CodeWrapper = styled.div`
  display: inline-block;
  ${colors.secondaryStatic};
  border: none;
  ${theme.dark} {
    background: rgb(18, 18, 18);
  }
`;

const ResponsiveCode = styled.div`
  font-size: 0.9rem;
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  ${theme.dark} {
    background: #121212;
    border-color: #2a2a2a;
  }
`;
