import { asset } from "@/lib/site";
import type { FrameworkId } from "./frameworks";
import type { PlaygroundFile } from "./types";

const title = (pkg: string): PlaygroundFile => ({
  name: "title",
  content: `import { styled } from "${pkg}";

export const Title = styled.h1\`
  margin: 0;
  font: 800 4.5rem/1.15 system-ui, sans-serif;
  background: linear-gradient(45deg, #d1c170, #ed8080);
  background-clip: text;
  color: transparent;
\`;
`,
});

const sizes: PlaygroundFile = {
  name: "sizes.yak",
  content: `const base = 230;

export const yakWidth = {
  big: \`\${base}px\`,
  small: \`\${Math.round(base * 0.65)}px\`,
};
`,
};

const styles = (props: string, read: string) => `const Center = styled.div\`
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

  \${${props} =>
    ${read} &&
    css\`
      width: \${yakWidth.small};
    \`}
\`;
`;

/** The same example in each framework, so a switch shows what changes and what stays. */
export const examples: Record<FrameworkId, PlaygroundFile[]> = {
  react: [
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

${styles("({ $small })", "$small")}`,
    },
    title("@yak/react"),
    sizes,
  ],
  // Solid reads props off the object, destructuring would lose reactivity
  solid: [
    {
      name: "index",
      content: `import { styled, css } from "@yak/solid";
import { createSignal } from "solid-js";
import { Title } from "./title";
import { yakWidth } from "./sizes.yak";

export default function App() {
  const [small, setSmall] = createSignal(false);

  return (
    <Center>
      <Yak
        $small={small()}
        onClick={() => setSmall(!small())}
        src="${asset("/img/yak-jumping.png")}"
        alt="The yak mascot. Click it!"
      />
      <Title>yak</Title>
    </Center>
  );
}

${styles("(props)", "props.$small")}`,
    },
    title("@yak/solid"),
    sizes,
  ],
};
