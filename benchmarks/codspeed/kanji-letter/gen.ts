import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";

// 2500 styled kanji components, each declared as `styled(JapaneseCard)` with
// an @media rule and a ::before pseudo-element. Tests extension + media +
// pseudo on a large workload.
const startCodePoint = 0x4e00; // start of the Unicode block for kanji
const endCodePoint = startCodePoint + 2500;

const kanjiCharacters = Array.from({ length: endCodePoint - startCodePoint }, (_, index) =>
  String.fromCodePoint(startCodePoint + index),
);

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib, /* withCss */ false)}

const JapaneseCard = ${styled}.div\`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
\`;

${kanjiCharacters
  .map(
    (kanji, index) => `const Kanji${index + 1}Character = ${styled}(JapaneseCard)\`
  font-size: 1em;
  @media (max-width: 640px) {
    font-size: 0.9em;
  }
  display: grid;
  &:before {
    display: block;
    color: #333;
    content: '${kanji}';
  }
\`;`,
  )
  .join("\n")}

const Wrapper = ${styled}.div\`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
\`;

export const KanjiLetterComponent${
    lib === "next-yak" ? "Yak" : "Styled"
  }: FunctionComponent = () => (
  <Wrapper>
    ${kanjiCharacters
      .map((_, index) => `<Kanji${index + 1}Character />`)
      .join("\n    ")}
  </Wrapper>
);
`;

  writeBenchmarkSource("KanjiLetterComponent", lib, fileContent);
}
