/**
 * The two extra files of the old playground's default example, frozen word for word.
 *
 * They are entries in the share-link dictionary (compress.ts), so they must never change:
 * an old link that kept these files encodes them as a single token each. The playground's
 * current default example lives in examples.ts and is free to change.
 */
export const LEGACY_EXAMPLE_FILES = {
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
} as const;
