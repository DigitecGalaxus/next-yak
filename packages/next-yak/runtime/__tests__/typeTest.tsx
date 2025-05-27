import { css, styled, keyframes } from "next-yak";
import React from "react";
import { useRef } from "react";

declare module "next-yak" {
  export interface YakTheme {
    mood: "happy" | "sad";
  }
}

const keyframe = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const mixin = css`
  animation: ${keyframe} 1s;
  color: ${({ theme }) => {
    // verify that theme is typed correctly in styled.tsx
    const mood: "happy" | "sad" = theme.mood;
    return mood === "happy" ? "green" : "red";
  }};
`;

const Button = styled.button`
  color: ${({ theme }) => {
    // verify that theme is typed correctly in styled.tsx
    const mood: "happy" | "sad" = theme.mood;
    return mood === "happy" ? "green" : "red";
  }};
  ${mixin}
`;

// Verify that a HTMLButtonElement Ref can be
// used for a styled.button component
const RefTest1 = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return <Button ref={ref}>Hello World</Button>;
};

// Verify that a HTMLButtonElement Ref function can be
// used for a styled.button component
const RefTest2 = () => {
  return (
    <Button
      ref={(element) => {
        const button: HTMLButtonElement = element!;
        console.log(button);
      }}
    >
      Hello World
    </Button>
  );
};

// Verify that a ref is inferred correctly
const Button2 = styled(Button)``;
const RefTest3 = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return <Button2 ref={ref}>Hello World</Button2>;
};

// Verify that a ref function is inferred correctly
const RefTest4 = () => {
  return (
    <Button2
      ref={(element) => {
        const button: HTMLButtonElement = element!;
        console.log(button);
      }}
    >
      Hello World
    </Button2>
  );
};

// Verify that props are merged correctly
const Button3 = styled.button<{ $primary?: boolean }>`
  ${({ $primary }) =>
    $primary &&
    css`
      color: green;
    `}
`;
const Button4 = styled(Button3)<{ $secondary?: boolean }>`
  ${({ $secondary }) =>
    $secondary &&
    css`
      color: blue;
    `}
`;

const MergeTest1 = () => {
  return (
    <Button4 type="button" $primary $secondary>
      Click me
    </Button4>
  );
};

const MergeTestErrors = () => {
  switch (Math.random().toString(64)) {
    case "$primary":
      // @ts-expect-error - primary must only allow booleans
      return <Button4 $primary="true" />;
    case "$secondard":
      // @ts-expect-error - secondard must only allow booleans
      return <Button4 $secondard="true" />;
    case "html prop":
      // @ts-expect-error - only valid html attribute values are allowed
      return <Button4 type="submit submit" />;
    case "html prop2":
      return <Button4 type="submit" />;
    case "ref":
      // @ts-expect-error - only valid html elements
      return <Button4 ref={(element: HTMLDivElement | null) => {}} />;
    case "theme":
      // @ts-expect-error - theme is not part of the props
      return <Button4 theme={{ mood: "happy" }} />;
    default:
      return null;
  }
};

// Verify that a ref is not added if the component does not accept it
const Button5 = (props: { className: string }) => (
  <button {...props}>Hello World</button>
);
const Button6 = styled(Button5)``;
<Button6
  // @ts-expect-error - should not allow ref on a component that does not accept it
  ref={console.log}
/>;

const CompositionOverridingAndMergingTest = () => {
  const case1 = () => {
    const Child = styled.div<{ $child: boolean }>`
      ${({ $child }) =>
        $child &&
        css`
          color: red;
        `}
    `;

    const Parent = styled.div`
      ${Child} {
        color: blue;
      }
    `;

    // should not inherit component props of Child
    const _ = (
      <Parent>
        <Child $child />
      </Parent>
    );
  };

  const case2 = () => {
    const Child = styled.div<{ $child: boolean }>`
      ${({ $child }) =>
        $child &&
        css`
          color: red;
        `}
    `;

    const Mixin = css<{ $mixin: boolean }>`
      color: ${({ $mixin }) => ($mixin ? `blue` : `red`)};
    `;

    const Parent = styled.div<{ $mixin: boolean }>`
      ${Child} {
        color: blue;
      }

      ${Mixin};
    `;

    // Overriding with Child and Mixin should work
    const _ = (
      <Parent $mixin>
        <Child $child />
      </Parent>
    );
  };

  const case3 = () => {
    const Child = styled.div<{ $child: boolean }>`
      ${({ $child }) =>
        $child &&
        css`
          color: red;
        `}
    `;

    const Parent = styled.div`
      ${Child} {
        color: blue;
      }
      color: ${
        // @ts-expect-error - should not allow props which have not been defined (like styled-components)
        ({ $colorMe }) => ($colorMe ? `blue` : `red`)
      };
    `;

    // Overriding with Child and Mixin should work
    const _ = (
      // @ts-expect-error - should not allow props which have not been defined (like styled-components)
      <Parent $colorMe>
        <Child $child />
      </Parent>
    );
  };

  const case4 = () => {
    const Wrap = styled.button``;
    const Icon = styled.svg<{ $active: boolean }>``;
    const Button = styled(Wrap)`
      ${Icon} {
        color: red;
      }
    `;
    const Button2 = styled.button`
      ${Icon} {
        color: red;
      }
    `;

    // @ts-expect-error $active should not be required
    <Button $active={true}>Click me</Button>;

    // @ts-expect-error $active should not be required
    <Button2 $active={true}>Click me</Button2>;

    // should be callable without any properties
    <Button>Click me</Button>;
    <Button2>Click me</Button2>;

    // the types should be equal
    type Equal = typeof Button extends typeof Button2 ? true : false;
    const _: Equal = true;
  };
};

const GenericComponentWorks = () => {
  interface MyGenericProps<T> {
    input: T;
  }

  type MyGenericComponent<T> = React.ElementType<MyGenericProps<T>> & {
    <TOther>(props: MyGenericProps<TOther>): React.ReactNode;
  };

  type MyDefaultType = {
    [x: string]: any;
  };

  const GenericComponent: MyGenericComponent<MyDefaultType> = () => {
    return null;
  };

  const ConcreteStyledComponent = GenericComponent<"test">;

  const MyComponent = styled(ConcreteStyledComponent)``;

  const Test = () => {
    return (
      <div>
        <MyComponent input="test" />
      </div>
    );
  };
};

const KeyframesWithConstants = () => {
  const constString = "rotate(360deg)";
  const constNumber = 360;

  const rotate = keyframes`
    from {
      transform: rotate(${constNumber}deg);
    }
    to {
      transform: ${constString};
    }
  `;
};

const SelectorMixinsShouldNotAlterType = () => {
  const Button = styled.button<{ $primary?: boolean }>``;

  const Mixin = css`
    ${Button} {
      color: red;
    }
  `;

  const X = styled.div`
    ${Button} {
      color: blue;
    }
    ${Mixin};
  `;

  <X />;
};

const InferenceShouldWorkWithComplexTypes = () => {
  const Title = styled<React.ComponentPropsWithRef<"strong" | "h1">>(
    {} as any,
  )<{
    $primary: boolean;
  }>`
    ${({ $primary }) => {
      if ($primary) {
        return css`
          color: red;
        `;
      }
    }}
  `;
};

const WebComponentsShouldWork = () => {
  const MyWebComponent = styled("my-web-component")<{ $primary?: boolean }>`
    color: red;
  `;

  // @ts-expect-error - web component props should match the defined props
  <MyWebComponent $primary={42} />;

  // Should allow all valid HTML attributes
  <MyWebComponent onClick={(e) => console.log("clicked", e.target)} />;

  // Should allow refs
  <MyWebComponent
    $primary
    ref={(el) => {
      if (el) {
        console.log(el.classList.toggle("active"));
      }
    }}
  />;

  <MyWebComponent $primary />;

  return <MyWebComponent />;
};
