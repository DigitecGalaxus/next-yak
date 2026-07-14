import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { precomputeStylePropValues } from "./precomputeStylePropValues.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const imports = `import { css, styled } from 'next-yak';`;

/** Two style conditions reading $tilt */
const sticker = `const Sticker = styled.div\`
  \${(p) => p.$tilt > 5 && css\`transform: rotate(3deg);\`}
  \${(p) => p.$tilt > 8 && css\`box-shadow: 0 0 8px black;\`}
\`;`;

/** One style condition reading the DOM prop disabled */
const button = `const Button = styled.button\`
  \${({ disabled }) => disabled && css\`opacity: 0.5;\`}
\`;`;

ruleTester.run("yak-precompute-style-prop-values", precomputeStylePropValues, {
  valid: [
    {
      // a precomputed value is an identifier, which is safe to inline twice
      code: `${imports} ${sticker} const App = () => { const tilt = Math.random() * 10; return <Sticker $tilt={tilt} />; };`,
    },
    {
      // a member expression is safe to inline twice
      code: `${imports} ${sticker} const App = ({ p }) => <Sticker $tilt={p.tilt} />;`,
    },
    {
      // a literal is safe to inline twice
      code: `${imports} ${sticker} const App = () => <Sticker $tilt={3} />;`,
    },
    {
      // a $prop read by a single condition is moved into it, not duplicated
      code: `${imports} const One = styled.div\`\${(p) => p.$tilt > 5 && css\`color: red;\`}\`; const App = () => <One $tilt={Math.random()} />;`,
    },
    {
      // a prop no style condition reads is never inlined
      code: `${imports} ${sticker} const App = () => <Sticker id={Math.random()} />;`,
    },
    {
      // a spread keeps the usage on the runtime path
      code: `${imports} ${sticker} const App = (props) => <Sticker $tilt={Math.random()} {...props} />;`,
    },
    {
      // a theme prop keeps the usage on the runtime path
      code: `${imports} ${sticker} const App = () => <Sticker $tilt={Math.random()} theme={{}} />;`,
    },
    {
      // an .attrs() chain is never inlined
      code: `${imports} const A = styled.div.attrs({})\`\${(p) => p.$a && css\`color: red;\`}\${(p) => p.$a && css\`top: 0;\`}\`; const App = () => <A $a={Math.random()} />;`,
    },
    {
      // a css variable keeps every usage of the component on the runtime path
      code: `${imports} const V = styled.div\`color: \${(p) => p.$c}; border-color: \${(p) => p.$c};\`; const App = () => <V $c={Math.random()} />;`,
    },
    {
      // an imported component is declared in another file and never inlined
      code: `${imports} import { Card } from './card'; const App = () => <Card $tilt={Math.random()} />;`,
    },
    {
      // a let binding can be reassigned and is never inlined
      code: `${imports} let L = styled.div\`\${(p) => p.$a && css\`color: red;\`}\${(p) => p.$a && css\`top: 0;\`}\`; const App = () => <L $a={Math.random()} />;`,
    },
    {
      // a dynamic styled(Component) keeps the runtime path
      code: `${imports} const Base = () => null; const W = styled(Base)\`\${(p) => p.$a && css\`color: red;\`}\${(p) => p.$a && css\`top: 0;\`}\`; const App = () => <W $a={Math.random()} />;`,
    },
  ],
  invalid: [
    {
      // two conditions read $tilt, so Math.random() is inlined into both
      code: `${imports} ${sticker} const App = () => <Sticker $tilt={Math.random() * 10} />;`,
      errors: [{ messageId: "precompute" }],
    },
    {
      // a DOM prop is evaluated on the element and in the condition reading it
      code: `${imports} ${button} const App = () => <Button disabled={Math.random() > 0.5} />;`,
      errors: [{ messageId: "precompute" }],
    },
    {
      // destructured style conditions are read the same way
      code: `${imports} const D = styled.div\`\${({ $a }) => $a && css\`color: red;\`}\${({ $a }) => $a && css\`top: 0;\`}\`; const App = () => <D $a={compute()} />;`,
      errors: [{ messageId: "precompute" }],
    },
    {
      // a pure call is flagged too: precomputing keeps the output small
      code: `${imports} ${sticker} const App = ({ s }) => <Sticker $tilt={Math.max(4, s)} />;`,
      errors: [{ messageId: "precompute" }],
    },
    {
      // a single condition reading the prop twice inlines it twice on its own
      code: `${imports} const T = styled.li\`\${({ $size }) => $size && $size === "big" && css\`padding: 8px;\`}\`; const App = (props) => <T $size={props.getSize()} />;`,
      errors: [{ messageId: "precompute" }],
    },
    {
      // the member form of a condition reading the prop twice
      code: `${imports} const M = styled.li\`\${(p) => p.$size && p.$size === "big" && css\`padding: 8px;\`}\`; const App = (props) => <M $size={props.getSize()} />;`,
      errors: [{ messageId: "precompute" }],
    },
  ],
});
