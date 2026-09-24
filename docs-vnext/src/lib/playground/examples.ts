import { asset } from "@/lib/site";
import type { PlaygroundFile } from "./types";

/**
 * The code a new visitor sees: the yak mascot from the old playground. It stays short on
 * purpose, one idea per file: a styled component with a prop-driven variant and a hover
 * (index), a component from another file (title), and a `.yak` file whose code runs at
 * build time, so only its results reach the CSS (sizes.yak).
 *
 * Unlike legacy-example.ts, this is free to change. The image path carries the base path,
 * so it loads on the GitHub Pages deploy as well as on localhost.
 */
export const defaultFiles: PlaygroundFile[] = [
  {
    name: "index",
    content: `import { styled, css } from "@yak/react";
import { useState } from "react";
import { Title } from "./title";
import { yakWidth } from "./sizes.yak";

export default function App() {
  const [small, setSmall] = useState(false);

  return (
    <Center>
      <Yak
        $small={small}
        onClick={() => setSmall(!small)}
        src="${asset("/img/yak-jumping.png")}"
        alt="The yak mascot. Click it!"
      />
      <Title>yak</Title>
    </Center>
  );
}

const Center = styled.div\`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 100%;
\`;

const Yak = styled.img<{ $small?: boolean }>\`
  width: \${yakWidth.big};
  cursor: pointer;
  transition: width 0.3s, transform 0.2s;

  &:hover {
    transform: translateY(-8px) rotate(-4deg);
  }

  \${({ $small }) =>
    $small &&
    css\`
      width: \${yakWidth.small};
    \`}
\`;
`,
  },
  {
    name: "title",
    content: `import { styled } from "@yak/react";

export const Title = styled.h1\`
  margin: 0;
  font: 800 4.5rem/1.15 system-ui, sans-serif;
  background: linear-gradient(45deg, #d1c170, #ed8080);
  background-clip: text;
  color: transparent;
\`;
`,
  },
  {
    name: "sizes.yak",
    content: `const base = 230;

export const yakWidth = {
  big: \`\${base}px\`,
  small: \`\${Math.round(base * 0.65)}px\`,
};
`,
  },
];
