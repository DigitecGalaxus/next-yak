type Example = {
  title: string;
  description: string;
  files: Record<string, string>;
};

export const examples = {
  base: {
    title: "Next Yak Logo",
    description:
      "A simple example of using Next Yak to create a styled component with a logo.",
    files: {
      index: `import { styled, css } from "next-yak";    
import { Title } from "./other";

export default function Component() {
  return (
    <Center>
      <div
        css={css\`
        max-width: 400px;
      \`}
      >
        <img
          src="/img/yak-jumping.png"
          css={css\`
            max-width: 100%;
          \`}
        />
        <Title>Next-Yak</Title>
      </div>
    </Center>
  );
}

const Center = styled.div\`
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
\`;`,
      other: `import { styled } from "next-yak";

export const theme = {
  dark: "html.dark &",
  light: "html.light &",
};

export const Title = styled.h1\`
  font-size: 5rem;
  font-weight: 400;
  text-align: center;
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;

  background: #000;
  background: radial-gradient(
    circle farthest-corner at top left,
    #000 0%,
    #333 100%
  );
  -webkit-text-fill-color: transparent;

  @supports (-webkit-text-stroke: red 1px) {
    transform: translateY(-4px);
    padding: 4px 0;
    \${theme.dark} {
      background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;
      -webkit-background-clip: text;
      background-clip: text;
    }
    background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;
    -webkit-text-fill-color: initial;
    -webkit-text-stroke: 4px transparent;
    -webkit-background-clip: text;
    background-clip: text;
    color: var(--color-fd-background);
    letter-spacing: 0.02em;
  }

  background-clip: text;
  -webkit-background-clip: text;
\`;`,
      "different.yak": `const green = "00ff00";
export const myColor = \`#\${ green }\`;`,
    },
  },
} as const satisfies Record<string, Example>;
