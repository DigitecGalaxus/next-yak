import { highlighterPromise } from "@/lib/shiki";
import { colors, theme } from "@/lib/utils/constants";
import { styled } from "next-yak";
import { use } from "react";

// Define the structure for code examples
type CodeExample = {
  tsxInput: string;
};

const initialCodeExample: CodeExample = {
  tsxInput: `import { styled, css } from "next-yak";

export const Title = styled.button<{ $primary: boolean }>\`
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
  return (
    <ResponsiveCode>
      <CodeWrapper
        dangerouslySetInnerHTML={{
          __html: highlighter.codeToHtml(initialCodeExample.tsxInput, {
            lang: "tsx",
            themes: {
              light: "vitesse-light",
              dark: "vitesse-dark",
            },
          }),
        }}
      ></CodeWrapper>
    </ResponsiveCode>
  );
};

// Styled components
const CodeWrapper = styled.div`
  display: inline-block;
  ${colors.secondaryStatic};
  border: none;

  & :global(.shiki) :global(.line) {
    white-space: pre-wrap;
  }

  :global(html.dark) & :global(.shiki),
  :global(html.dark) & :global(.shiki) span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
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
