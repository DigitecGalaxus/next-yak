/** @jsxImportSource next-yak */
// this is only a type check file and should not be executed

import { css, styled } from "next-yak";
import { ComponentProps, CSSProperties } from "react";

declare module "next-yak" {
  export interface YakTheme {
    primaryColor: "red" | "blue";
  }
}

const ComponentWithCssProp = () => {
  return <div css={css``} />;
};

const NestedComponentWithCssProp = () => (
  <div>
    <p>
      <div
        css={css`
          padding: 10px;
        `}
      >
        anything
      </div>
    </p>
  </div>
);

const ComponentThatTakesCssProp = (p: {
  className?: string;
  style?: ComponentProps<"div">["style"];
}) => <div {...p}>anything</div>;

const ComponentThatTakesCssProp2 = (p: {
  className?: string | string[];
  style?: {};
}) => <div {...(p as any)}>anything</div>;

const ComponentThatTakesCssProp3 = (p: {
  className: string;
  style?: Record<string, unknown>;
}) => <div {...p}>anything</div>;

const ComponentThatTakesCssProp4 = (p: {
  className?: unknown;
  style?: unknown;
}) => <div {...(p as any)}>anything</div>;

const ComponentWithCssPropAsProp = () => {
  return (
    <>
      <ComponentThatTakesCssProp css={css``} />
      <ComponentThatTakesCssProp2 css={css``} />
      <ComponentThatTakesCssProp3 css={css``} className="" />
      <ComponentThatTakesCssProp4 css={css``} />
    </>
  );
};

const ObjectWithComponent = {
  ComponentThatTakesCssProp,
  nested: {
    ComponentThatTakesCssProp,
  },
};
const ComponentThatUsesObjectWithComponent = () => (
  <ObjectWithComponent.ComponentThatTakesCssProp
    css={css`
      padding: 10px;
    `}
  />
);

const ComponentThatUsesNestedObjectWithComponent = () => (
  <ObjectWithComponent.nested.ComponentThatTakesCssProp
    css={css`
      padding: 10px;
    `}
  />
);

const ComponentWithCSSPropString = () => (
  <div
    // @ts-expect-error shouldn't allow strings as css prop
    css={`
      padding: 10px;
    `}
  >
    anything
  </div>
);

const padding = css`
  padding: 10px;
`;
const ComponentThatReusesCSS = () => <div css={padding} />;

const ComponentWithConditionalCSSProp = () => (
  <div
    css={
      true &&
      css`
        padding: 10px;
      `
    }
  >
    anything
  </div>
);

const ComponentWithConditionalCSSProp2 = () => (
  <div
    css={
      true
        ? padding
        : css`
            padding: 20px;
          `
    }
  />
);

const ComponentWithInterpolatedCSS = () => {
  const x = Math.random() > 0.5;
  return (
    <div
      // @ts-expect-error shouldn't allow interpolated css prop
      css={(x) => css`
        padding: 20px;
      `}
    />
  );
};

const Text = styled.p`
  font-size: 20px;
  font-weight: bold;
  font-family: "Inter";
`;

const StyledComponentWithCSSProp = () => {
  <div>
    <Text
      css={css`
        color: red;
      `}
    >
      test
    </Text>
  </div>;
};

const ComponentWithConditionalCSSButWithoutOwnProps = () => {
  const x = Math.random() > 0.5;
  return (
    <div
      css={css`
        ${() =>
          x &&
          css`
            padding: 20px;
          `}
      `}
    />
  );
};

const ComponentWithConditionalCSSVarsButWithoutOwnProps = () => {
  const x = Math.random() > 0.5;
  return (
    <div
      css={css`
        padding: ${() => x && "20px"};
      `}
    />
  );
};

const ComponentWithDynamicCSSShouldGenerateTypeError = () => {
  return (
    <div
      // @ts-expect-error - properties not supported
      css={css<{ $primary: boolean }>`
        padding: ${({ $primary }) => $primary && "20px"};
      `}
    />
  );
};

const dynamicMixin = css<{ $primary: boolean }>`
  ${({ $primary }) =>
    $primary &&
    css`
      font-size: 1.7rem;
    `}
`;

const ComponentWithCSSThatUsesDynamicMixinShouldGenerateTypeError = () => {
  return (
    <div
      css={css`
        ${
          // @ts-expect-error - properties not supported
          dynamicMixin
        }
      `}
    />
  );
};
