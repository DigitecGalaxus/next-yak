import { styled } from "@yak/solid";
import { createSignal } from "solid-js";

// `a` and `title` exist in HTML and in SVG. Inside the svg they must get the
// SVG namespace, outside it the HTML one, on the server and after hydration.
const Icon = styled.svg`
  width: 24px;
  height: 24px;
`;

const Dot = styled.circle<{ $active?: boolean }>`
  fill: ${({ $active }) => ($active ? "red" : "gray")};
`;

const Caption = styled.title`
  display: none;
`;

const Link = styled.a`
  color: blue;
`;

// attrs keep this one on the runtime path in both fold modes: a folded native
// <a> in a conditional child gets no svg context from the solid compiler
const MountedLink = styled.a.attrs({ "data-mounted": "yes" })`
  color: blue;
`;

export default function App() {
  const [active, setActive] = createSignal(false);
  return (
    <div>
      <Icon data-testid="icon" viewBox="0 0 24 24">
        <Caption data-testid="caption">dot</Caption>
        <Link data-testid="inner-link" href="#inner">
          <Dot data-testid="dot" cx="12" cy="12" r="10" $active={active()} />
        </Link>
        {/* mounted on the client after the toggle: the namespace comes from the parent */}
        {active() && <MountedLink data-testid="mounted-inner" href="#mounted" />}
      </Icon>
      <Link
        data-testid="outer-link"
        href="#outer"
        onClick={(e) => (e.preventDefault(), setActive(true))}
      >
        toggle
      </Link>
      {active() && <MountedLink data-testid="mounted-outer" href="#mounted" />}
    </div>
  );
}
