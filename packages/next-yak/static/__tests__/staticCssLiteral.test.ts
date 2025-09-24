import { it, expect } from "vitest";
import { css } from "../staticCssLiteral";

it("render static strings unchanged", () => {
  const styles = css`
    .test {
      color: red;
    }
  `;
  expect(styles).toBe(".test {\n      color: red;\n    }");
});

it("filter out null, undefined and false", () => {
  const styles = css`
    .test {
      color: red;
      ${null}
      ${undefined}
      ${false}
    }
  `;
  expect(styles).toBe(
    ".test {\n      color: red;\n      \n      \n      \n    }",
  );
});

it("convert numbers to string", () => {
  const styles = css`
    .test {
      color: red;
      line-height: ${1}em;
      border: ${0}px;
    }
  `;
  expect(styles).toBe(
    ".test {\n      color: red;\n      line-height: 1em;\n      border: 0px;\n    }",
  );
});

it("work nested", () => {
  const styles = css`
    .test {
      ${true &&
      css`
        color: red;
      `}
    }
  `;
  expect(styles).toBe(".test {\n      color: red;\n    }");
});
