import { css, styled } from "next-yak";
import type { ReactNode } from "react";

// A styled component target receives the generated class, the author's props
// and even a prop named `component`, but never the $ props that only drive
// the styles.
function Card(props: {
  className?: string;
  component?: string;
  title?: string;
  children?: ReactNode;
}) {
  const keys = Object.keys(props).sort().join(",");
  return (
    <div
      data-testid="card"
      data-keys={keys}
      data-component={props.component}
      className={props.className}
    >
      {props.children}
    </div>
  );
}

const StyledCard = styled(Card)<{ $accent?: boolean }>`
  padding: 12px;
  color: rgb(0, 0, 255);
  ${({ $accent }) =>
    $accent &&
    css`
      color: rgb(255, 0, 0);
    `}
`;

// A target that merges defaults into its props must still see the filtered
// props: the generated class, no $ props.
function MergedCard(props: { className?: string; title?: string; children?: ReactNode }) {
  const merged = { role: "note", ...props };
  const keys = Object.keys(merged).sort().join(",");
  return (
    <div
      data-testid={merged.title}
      data-keys={keys}
      role={merged.role}
      className={merged.className}
    >
      {merged.children}
    </div>
  );
}

const StyledMerged = styled(MergedCard)<{ $accent?: boolean }>`
  padding: 12px;
  color: rgb(0, 0, 255);
  ${({ $accent }) =>
    $accent &&
    css`
      color: rgb(255, 0, 0);
    `}
`;

export default function App() {
  const spread = { $accent: true, title: "merged-spread" };
  return (
    <>
      <StyledCard $accent component="section" title="hello">
        wrapped
      </StyledCard>
      <StyledMerged $accent title="merged-plain">
        merged
      </StyledMerged>
      <StyledMerged {...spread} data-spread="1">
        merged
      </StyledMerged>
    </>
  );
}
