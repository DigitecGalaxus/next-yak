import Link from "next/link";
import { styled } from "next-yak";
import { benchmarks } from "./bench/manifest";

const Page = styled.div`
  font-family: system-ui, sans-serif;
  max-width: 75ch;
  margin: 32px auto;
  padding: 0 16px;
  color: #222;
`;

const List = styled.ul`
  & > * {
    margin-block-start: 10px;
  }
  line-height: 1.4;
`;

const Description = styled.span`
  display: block;
  color: #555;
`;

export default function Home() {
  return (
    <Page>
      <h1>next-yak benchmarks</h1>
      <p>
        Each benchmark below has a generator at <code>benchmarks/bench/&lt;slug&gt;/gen.ts</code>{" "}
        and is registered in the benchmark harness. The links here render the same components in
        the browser so you can inspect the rendered DOM, classes, and CSS that each library
        produces.
      </p>
      <List>
        {benchmarks.map((b) => (
          <li key={b.slug}>
            <Link href={`/bench/${b.slug}`}>{b.name}</Link>{" "}
            <Description>{b.description}</Description>
          </li>
        ))}
      </List>
    </Page>
  );
}
