import { styled } from "@yak/solid";

/**
 * A block element inside a <p> — valid to build programmatically, but
 * markup the HTML parser restructures when it appears in an innerHTML
 * template. The paragraph styles the box through a component selector,
 * so a relocation silently unstyles it: the test asserts the written
 * styles apply in both fold modes.
 */
const Box = styled.div`
  color: rgb(0, 0, 255);
`;

const Paragraph = styled.p`
  color: rgb(0, 128, 0);

  ${Box} {
    background-color: rgb(255, 255, 0);
  }
`;

export default function App() {
  return (
    <main>
      <span data-testid="before">before</span>
      <Paragraph data-testid="paragraph">
        <Box data-testid="box">boxed</Box>
      </Paragraph>
      <span data-testid="after">after</span>
    </main>
  );
}
