import { css } from "next-yak";

// folds: both arms are fully static
const Elem = ({ active }: { active: boolean }) => {
  return (
    <div
      css={
        active
          ? css`
              color: red;
            `
          : css`
              color: blue;
            `
      }
    />
  );
};

// folds: one arm carries its own condition
const Elem2 = ({ active, big }: { active: boolean; big: boolean }) => {
  return (
    <div
      css={
        active
          ? css`
              color: red;
              ${() =>
                big &&
                css`
                  font-size: 20px;
                `}
            `
          : css`
              color: blue;
            `
      }
    />
  );
};

// stays on the runtime path: one arm holds a dynamic value
const Elem3 = ({ active, width }: { active: boolean; width: number }) => {
  return (
    <div
      css={
        active
          ? css`
              width: ${() => width}px;
            `
          : css`
              color: blue;
            `
      }
    />
  );
};
